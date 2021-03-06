/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.hurence.logisland.historian.service;

import com.hurence.logisland.historian.parsing.QueryParsing;
import com.hurence.logisland.historian.repository.SolrTagRepository;
import com.hurence.logisland.historian.rest.v1.model.Tag;
import com.hurence.logisland.historian.rest.v1.model.TreeNode;
import com.hurence.logisland.historian.rest.v1.model.operation_report.ReplaceReport;
import com.hurence.logisland.historian.rest.v1.model.operation_report.TagReplaceReport;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.solr.core.query.result.FacetPage;
import org.springframework.data.solr.core.query.result.FacetPivotFieldEntry;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.swing.text.html.Option;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TagsApiService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Resource
    private SolrTagRepository repository;

    private DataflowsApiService dataflowsApiService;

    @Autowired
    public void setDataflowsApiService(DataflowsApiService dataflowsApiService) {
        this.dataflowsApiService = dataflowsApiService;
    }


    public Optional<Tag> deleteTag(String id) {
        return this.deleteTagWithoutGeneratingConf(id);
    }

    /**
     * delete tags of datasource. Return number of tag deleted.
     */
    public long deleteTagsOfDatasource(String datasourceId) {
        long numberOfTagDeleted = repository.deleteByDatasourceId(datasourceId);
        logger.info("deleted all {} tags of Datasource {}", numberOfTagDeleted, datasourceId);
        return numberOfTagDeleted;
    }

    private Optional<Tag> deleteTagWithoutGeneratingConf(String id) {
        logger.info("deleting Tag {}", id);
        Optional<Tag> tagToRemove = repository.findById(id);
        if (tagToRemove.isPresent()) {
            repository.delete(tagToRemove.get());
//            repository.deleteById(tagToRemove.get().getId_());
        }
        return tagToRemove;
    }

    public Optional<Tag> getTag(String id) {
        logger.debug("getting Tag {}", id);
        return repository.findById(id);
    }

    private ReplaceReport<Tag> createOrReplaceATag(Tag tag) {
        logger.debug("create or replace Tag {}", tag.getId());
        Optional<Tag> tagToReplace = repository.findByNodeIdAndDatasourceId(tag.getNodeId(), tag.getDatasourceId());
        if (tagToReplace.isPresent()) {
            Tag savedTag = updateTag(tag, tagToReplace.get().getId());
            return new TagReplaceReport(savedTag, false);
        } else {
            Tag savedTag = saveTag(tag);
            return new TagReplaceReport(savedTag, true);
        }
    }

    public ReplaceReport<Tag> createOrReplaceATag(Tag tag, String id) {
        ReplaceReport<Tag> report;
        if (!tag.getId().equals(id)) {
            report = createOrReplaceATag(tag.id(id));
        } else {
            report = createOrReplaceATag(tag);
        }
        return report;
    }

    public List<Tag> getAllTags(String fq, Optional<Integer> limit,
                                Optional<String> sortParam) {
        String query = fq;
        if (fq == null || fq.isEmpty())
            query = "*";
        Sort sort = Sort.unsorted();
        if (sortParam.isPresent()) {
            sort = QueryParsing.parseSortParam(sortParam.get());
        }
        Pageable myPage = null;
        if (limit.isPresent()) {
            myPage = PageRequest.of(0, limit.get(), sort);
        }
        if (myPage == null) {
            return repository.findByText(query, sort);
        } else {
            return repository.findByText(query, myPage);
        }
    }

    public List<Tag> getAllTagsFromDatasource(String datasourceId) {
        return repository.findByDatasource(datasourceId);
    }

    public List<Tag> getAllEnabledTagsFromDatasource(String datasourceId) {
        return repository.findByAllEnabledFromDatasource(datasourceId);
    }

    public List<TreeNode> getTreeTag(int page, int limit) {
        FacetPage<Tag> facet = repository.findTreeFacetOnDatasourceIdThenGroup(PageRequest.of(page, limit));
        List<FacetPivotFieldEntry> domainPiv = facet.getPivot("datasource_id,group");
        return buildTreeNodes(domainPiv);
    }

    public List<TreeNode> buildTreeNodes(List<FacetPivotFieldEntry> facetPivotFields) {
        return facetPivotFields.stream()
                .map(this::buildTreeNode)
                .collect(Collectors.toList());
    }

    public TreeNode buildTreeNode(FacetPivotFieldEntry facetPivot) {
        TreeNode node = new TreeNode();
        node.setValue(facetPivot.getValue());
        node.setTotalChildNumber(facetPivot.getValueCount());
        List<TreeNode> children = buildTreeNodes(facetPivot.getPivot());
        node.setChildren(children);
        return node;
    }

    /**
     *
     * @param tags
     * @return true if all items were created. If at least one tag was updated (existed before), it returns false.
     */
    public List<Tag> SaveOrUpdateMany(List<Tag> tags) {
        List<Tag> updatedTags = tags.stream().map(tag -> createOrReplaceATag(tag).getItem())
                .flatMap(o -> o.isPresent() ? Stream.of(o.get()) : Stream.empty())
                .collect(Collectors.toList());
        return updatedTags;
    }

    public List<Tag> deleteManyTag(List<String> tagIds) {
        List<Tag> supressedTags = tagIds.stream().map(id -> this.deleteTagWithoutGeneratingConf(id))
                .flatMap(o -> o.isPresent() ? Stream.of(o.get()) : Stream.empty())
                .collect(Collectors.toList());
        return supressedTags;
    }

    /**
     *
     * @param tag
     * @return save tag generating a random id and setting LastModificationDate
     */
    public Tag saveTag(Tag tag) {
        tag.setId(UUID.randomUUID().toString());
        tag.setLastModificationDate(new Date().getTime());
        return repository.save(tag);
    }

    /**
     *
     * @param tag
     * @param id
     * @return update tag with specified id with tag object setting LastModificationDate
     */
    public Tag updateTag(Tag tag, String id) {
        tag.setId(id);
        tag.setLastModificationDate(new Date().getTime());
        return repository.save(tag);
    }

}