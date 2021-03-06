package com.hurence.logisland.historian.rest.v1.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.io.Serializable;
import org.springframework.validation.annotation.Validated;
import javax.validation.Valid;
import javax.validation.constraints.*;

import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;
import org.threeten.bp.format.DateTimeFormatter;
import org.threeten.bp.OffsetDateTime;

/**
* Error
*/
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-08-29T22:27:12.655+02:00")


@SolrDocument(solrCoreName = "historian")
public class Error  implements Serializable {
        @JsonProperty("code")
        @Indexed(name = "code")
        private Integer code = null;

        @JsonProperty("message")
        @Indexed(name = "message")
        private String message = null;

        public Error code(Integer code) {
        this.code = code;
        return this;
        }

    /**
        * Get code
    * @return code
    **/
        @JsonProperty("code")
    @ApiModelProperty(required = true, value = "")
      @NotNull


  public Integer getCode() {
    return code;
    }

        public Error setCode(Integer code) {
        this.code = code;
        return this;
        }

        public Error message(String message) {
        this.message = message;
        return this;
        }

    /**
        * Get message
    * @return message
    **/
        @JsonProperty("message")
    @ApiModelProperty(required = true, value = "")
      @NotNull


  public String getMessage() {
    return message;
    }

        public Error setMessage(String message) {
        this.message = message;
        return this;
        }


    @Override
    public boolean equals(java.lang.Object o) {
    if (this == o) {
    return true;
    }
    if (o == null || getClass() != o.getClass()) {
    return false;
    }
        Error error = (Error) o;
        return Objects.equals(this.code, error.code) &&
        Objects.equals(this.message, error.message);
    }

    @Override
    public int hashCode() {
    return Objects.hash(code, message);
    }


@Override
public String toString() {
StringBuilder sb = new StringBuilder();
sb.append("{\n");

sb.append("    code: ").append(toIndentedString(code)).append("\n");
sb.append("    message: ").append(toIndentedString(message)).append("\n");
sb.append("}");
return sb.toString();
}

    /**
    * Convert the given object to string with each line indented by 4 spaces
    * (except the first line).
    */
    private String toIndentedString(java.lang.Object o) {
    if (o == null) {
        return "null";
    }
    if (o instanceof OffsetDateTime) {
        return ((OffsetDateTime) o).format(DateTimeFormatter.ISO_INSTANT);
    }
        return o.toString().replace("\n", "\n    ");
    }
}
