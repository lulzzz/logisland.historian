/**
* NOTE: This class is auto generated by the swagger code generator program (2.3.1).
* https://github.com/swagger-api/swagger-codegen
* Do not edit the class manually.
*/
package com.hurence.logisland.historian.rest.v1.api;

import com.hurence.logisland.historian.rest.v1.model.Error;
import io.swagger.annotations.*;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import javax.validation.constraints.*;
import java.util.List;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2018-07-24T21:20:56.826+02:00")

@Api(value = "metrics", description = "the metrics API")
    public interface MetricsApi {

            @ApiOperation(value = "retrieve all job metrics in Prometheus format", nickname = "getMetrics", notes = "get Prometheus metrics. have a look to https://prometheus.io/docs/instrumenting/exposition_formats/", response = String.class, tags={ "metrology", })
            @ApiResponses(value = { 
                @ApiResponse(code = 200, message = "metrics", response = String.class),
                @ApiResponse(code = 200, message = "unexpected error", response = Error.class) })
            @RequestMapping(value = "/api/v1/metrics",
                produces = { "text/plain" }, 
            method = RequestMethod.GET)
        ResponseEntity<String> getMetrics();

        }
