package router

import (
	"log"
	"zentro/internal/filters"
)

func MatchFilter(name string) filters.Filter {
    switch filters.FilterTypeFromName(name) {
    case filters.LoggingFilterType: return &filters.LoggingFilter{}
    case filters.RateLimitFilterType:return &filters.RateLimitFilter{}
    case filters.AddHeaderFilterType:return &filters.AddHeaderFilter{}
    case filters.AddRequestParamFilterType:return &filters.AddRequestParamFilter{}
    case filters.RemoveHeaderFilterType:return &filters.RemoveHeaderFilter{}
    case filters.RewritePathFilterType: return &filters.RewritePathFilter{}
    case filters.SetPathFilterType: return &filters.SetPathFilter{}
    case filters.StripPrefixFilterType: return &filters.StripPrefixFilter{}
    case filters.PrefixPathFilterType: return &filters.PrefixPathFilter{}
    case filters.RedirectToFilterType: return &filters.RedirectToFilter{}
    case filters.SetStatusFilterType: return &filters.SetStatusFilter{}
    case filters.ModifyResponseBodyFilterType: return &filters.ModifyResponseBodyFilter{}
    case filters.ModifyRequestBodyFilterType: return &filters.ModifyRequestBodyFilter{}
    case filters.CorsWebFilterType : return &filters.CorsWebFilter{}
    case filters.MapRequestHeaderFilterType: return &filters.MapRequestHeaderFilter{}
    case filters.PreserveHostHeaderFilterType: return &filters.PreserveHostHeaderFilter{}
    case filters.RequestSizeFilterType: return &filters.RequestSizeFilter{}

    default:
        log.Printf("Unknown filter: %s", name)
        return &filters.GenericFilter{}
    }
}
