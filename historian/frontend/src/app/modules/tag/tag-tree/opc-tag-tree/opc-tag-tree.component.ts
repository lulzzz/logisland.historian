import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { ArrayUtil } from '../../../../shared/array-util';
import { Datasource, TagBrowsingMode } from '../../../datasource/Datasource';
import { HistorianTag, IHistorianTag } from '../../modele/HistorianTag';
import { OpcTag } from '../../modele/OpcTag';
import { ITag, Tag } from '../../modele/tag';
import { NgTreenodeService } from '../../service/ng-treenode.service';
import { TagHistorianService } from '../../service/tag-historian.service';
import { TagOpcService } from '../../service/tag-opc.service';
import { ITagFormInput, TagFormInput } from '../../tag-form/TagFormInput';
import { BaseTagTreeComponent } from '../BaseTagTreeComponent';
import { TypesName } from '../TypesName';
import { QuestionBase } from '../../../../shared/dynamic-form/question-base';
import { QuestionService } from '../../../../shared/dynamic-form/question.service';

@Component({
  selector: 'app-opc-tag-tree',
  templateUrl: './opc-tag-tree.component.html',
  styleUrls: ['./opc-tag-tree.component.css']
})
export class OpcTagTreeComponent extends BaseTagTreeComponent implements OnInit, OnChanges {

  @Input() withExpandAll?: boolean = true;
  @Input() withCollapseAll?: boolean = true;
  @Input() datasource: Datasource;

  displayEdit = false;
  selectedTag: ITag;
  // memory to update tree
  nodeForRegister: TreeNode;
  tagEditQuestions: QuestionBase<any>[];

  constructor(private ngTreenodeService: NgTreenodeService,
              private messageService: MessageService,
              private tagOpcService: TagOpcService,
              private tagHistorianService: TagHistorianService,
              private arrayUtil: ArrayUtil,
              private questionService: QuestionService) {
                super();
                // this.tagsInputForForm = [];
               }

  ngOnInit() {
    this.tagEditQuestions = this.questionService.getTagForm();
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.datasource && !changes.datasource.isFirstChange()) {
      this.treeNodes = [];
      if (this.datasource !== null) {
        this.setLoading();
        switch (this.datasource.tag_browsing) {
          case TagBrowsingMode.AUTOMATIC:
            this.tagOpcService.browseTags(
              this.datasource.id,
              { nodeId: this.datasource.findRootNodeId(), depth: 1 }
            ).subscribe(tags => {
              this.treeNodes = tags.map(tag => this.ngTreenodeService.buildNodeFromTag(tag));
              this.updateAlreadyRegistredTags(this.treeNodes);
            });
            break;
          case TagBrowsingMode.MANUAL:
            this.tagHistorianService.getAllFromDatasource(this.datasource.id).subscribe(tags => {
              this.treeNodes = tags.map(tag => this.ngTreenodeService.buildNodeFromTag(tag));
            });
            break;
          default:
            console.error('unknown TagBrowsingMode type :', this.datasource.tag_browsing);
            break;
        }
        this.loading = false;
      }
    }
  }

  /**
   * For every tag node, look if it is already registred.
   * If yes, then we fill tag with correponding data
   * If not, do nothing.
   */
  private updateAlreadyRegistredTags(nodes: TreeNode[]): void {
    nodes.forEach(n => {
      if (n.type === TypesName.TAG_OPC) {
        this.tagHistorianService.getByNodeIdAndDatasourceId(n.data.node_id, n.data.datasource_id).subscribe(
          tags => {
            switch (tags.length) {
              case 1:
                this.updateNodeWithHistorianTag(n, tags[0]);
                break;
              case 0:
              default:
                break;
            }
          },
          error => { }
        );
      }
    });
  }

  hasTagChildren(node: TreeNode): boolean {
    if (node.children && node.children.length !== 0) {
      if (node.children[0].type !== TypesName.FOLDER) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  loadNode(event): void {
    const node: TreeNode = event.node;
    this.loadANodeIfNeeded(node);
  }

  setLoading(): void {
    this.loading = true;
  }

  /**
   *
   * @param node node that will be used when receiving saved tags to modify tags in tree
   *             Can be null, in this case tags will be considered as new tags and will be inserted in root.
   *             See method (onTagSaved)
   */
  showEditDialog(node: TreeNode): void {
    this.nodeForRegister = node;
    this.selectedTag = node.data;
    this.displayEdit = true;
  }

  private getTagsFromNode(node: TreeNode): Tag[] {
    if (node.type === TypesName.TAG_HISTORIAN || node.type === TypesName.TAG_OPC) {
      return [node.data];
    } else {
      return node.children.map(n => this.getTagsFromNode(n))
        .reduce((acc, x) => acc.concat(x), []);
    }
  }

  private getNodesFromNode(node: TreeNode, typeNodeToKeep: string[]): TreeNode[] {
    if (typeNodeToKeep.includes(node.type)) {
      return [node];
    } else {
      return node.children.map(n => this.getNodesFromNode(n, typeNodeToKeep))
        .reduce((acc, x) => acc.concat(x), []);
    }
  }

  showDetailDialog(tag: ITag): void {
    this.selectedTag = tag;
    // this.displayTagDetail = true;
  }

  deleteTags(node: TreeNode): void {
    const tagNodes = this.getNodesFromNode(node, [TypesName.TAG_HISTORIAN]);
    const tagsToDelete: string[] = tagNodes.map(tagNode => (<IHistorianTag>tagNode.data).id);
    this.tagHistorianService.deleteMany(tagsToDelete).subscribe(deletedTags => {
      tagNodes.forEach(n => this.updateNodeAfterDeletingTag(n));
    });
  }

  deleteTag(node: TreeNode): void {
    const tag: HistorianTag = node.data;
    this.tagHistorianService.delete(tag.id).subscribe(deletedTag => this.updateNodeAfterDeletingTag(node));
  }

  private updateNodeAfterDeletingTag(node: TreeNode): void {
    switch (this.datasource.tag_browsing) {
      case TagBrowsingMode.AUTOMATIC:
        if (node.type === TypesName.TAG_HISTORIAN) {
          (<IHistorianTag>node.data).update_rate = null;
          (<IHistorianTag>node.data).enabled = false;
          const opcTag = new OpcTag(node.data);
          node.data = opcTag;
          node.type = TypesName.TAG_OPC;
          node.icon = node.type;
        }
        break;
      case TagBrowsingMode.MANUAL:
        if (node.parent) {
          this.arrayUtil.remove(node.parent.children, n => n.data.id === node.data.id);
        } else {
          this.arrayUtil.remove(this.treeNodes, n => n.data.id === node.data.id);
        }
        break;
      default:
        console.error('unknown TagBrowsingMode type :', this.datasource.tag_browsing);
        break;
    }
  }

  toggleEnableds(node: TreeNode): void {
    const enabledRootNode = node.data;
    this.applyToNodeOfTag(node,
      this.forceToggleEnabled.bind(this, enabledRootNode),
      this.conditionToggle.bind(this, enabledRootNode));
  }

  private conditionToggle(enable: boolean, tag: Tag): boolean {
    if (tag.enabled === enable) {
      return false;
    } else {
      return true;
    }
  }

  private forceToggleEnabled(enabled: boolean, node: TreeNode): void {
    node.data.enabled = enabled;
    this.tagHistorianService.createOrReplace(new HistorianTag(node.data)).subscribe(t => {
      this.updateNodeWithHistorianTag(node, t);
    });
  }

  toggleEnabled(node: TreeNode): void {
    this.tagHistorianService.createOrReplace(new HistorianTag(node.data)).subscribe(t => {
      this.updateNodeWithHistorianTag(node, t);
    });
  }

  /**
   * Update node of the saved tag.
   * Use this.nodeForRegister to improve performance, if this.nodeForRegister is null add a node with this tag
   * as the tag is considered to not be in tree.
   * @param tag saved in form by user
   */
  onTagSaved(tag: HistorianTag): void {
    this.displayEdit = false;
    if (this.nodeForRegister === null) {
      this.addNodeAfterSavingTag(this.treeNodes, tag);
    } else {
      const nodeToUpdate: TreeNode | null = this.findNodeOfTag(this.nodeForRegister, tag);
      if (nodeToUpdate === null) {
          this.messageService.add({
          severity: 'error',
          summary: 'Could not find node to update in tree, please refresh the page to have accurate data',
          detail: `Tag id was '${tag.id}'`,
        });
      } else {
        this.updateNodeWithHistorianTag(nodeToUpdate, tag);
      }
    }
  }

  private addNodeAfterSavingTag(nodes: TreeNode[], tag: HistorianTag): void {
    const nodeToAppend = this.ngTreenodeService.buildNodeFromTag(tag);
    nodes.push(nodeToAppend);
  }

  addNodeFromTag(tag: HistorianTag) {
    this.addNodeAfterSavingTag(this.treeNodes, tag);
  }

  private updateNodeWithHistorianTag(node: TreeNode, tag: HistorianTag): void {
    Object.assign(node.data, tag);
    if (node.type === TypesName.TAG_OPC) {
      node.data = new HistorianTag(node.data);
      node.type = TypesName.TAG_HISTORIAN;
      node.icon = node.type;
    }
  }
  /**
   * return node of tag or null if not found
   *
   * @param node node to search in
   * @param tag tag we search the corresponding node
   */
  private findNodeOfTag(node: TreeNode, tag: IHistorianTag): TreeNode | null {
    if (node === undefined || node === null) return null;
    switch (node.type) {
      case TypesName.TAG_HISTORIAN:
      case TypesName.TAG_OPC:
       if (node.data.node_id === tag.node_id) return node;
       break;
      // case TypesName.GROUP:
      //   return node.children.find(n => n.data.node_id === tag.node_id);
      case TypesName.FOLDER:
        return node.children.find(n => n.data.node_id === tag.node_id);
        // node.children.forEach(n => {
        //   const found = this.findNodeOfTag(n, tag);
        //   if (found) return found;
        // });
        // break;
    }
    return null;
  }

    /**
   * return node of tag or undefined if not found
   */
  private applyToNodeOfTag(node: TreeNode, method: (TreeNode: TreeNode) => void,
                          conditionOnTag: (tag: Tag) => boolean): void {
    if (node === undefined) return undefined;
    switch (node.type) {
      case TypesName.TAG_HISTORIAN:
      case TypesName.TAG_OPC:
        if (conditionOnTag(node.data)) method(node);
      break;
      default: {
        node.children.forEach(n => this.applyToNodeOfTag(n, method, conditionOnTag));
      }
    }
  }

  protected loadANodeIfNeeded(node: TreeNode): boolean {
    if (node && node.type === TypesName.FOLDER && (!node.children  || node.children.length === 0)) {
      this.loading = true;
      this.tagOpcService.browseTags(this.datasource.id, { nodeId: node.data.node_id , depth: 1 }).subscribe(tags => {
        const children = tags.map(tag => this.ngTreenodeService.buildNodeFromTag(tag));
        this.updateAlreadyRegistredTags(children);
        if (children.length === 0) {
          node.children = [this.ngTreenodeService.getEmptyNode()];
        } else {
          node.children = children;
        }
        this.loading = false;
      });
      return true;
    }
    return false;
  }
}
