package filters

import "net/http"

type Filter interface {
    Apply(next http.Handler) http.Handler
	Convert(filter GenericFilter)
}


type FilterType int

const (
    UnknownFilter FilterType = iota
    LoggingFilterType
    RateLimitFilterType
    AuthFilterType
    AddHeaderFilterType
    RemoveHeaderFilterType
    AddRequestParamFilterType
    FilterTypeExample
    RewritePathFilterType
    SetPathFilterType
    StripPrefixFilterType
    PrefixPathFilterType
    RedirectToFilterType
    SetStatusFilterType
    ModifyResponseBodyFilterType
    ModifyRequestBodyFilterType
    CorsWebFilterType
    MapRequestHeaderFilterType
    PreserveHostHeaderFilterType
    RequestSizeFilterType
)

func FilterTypeFromName(name string) FilterType {
    switch name {
    case "Logging":
        return LoggingFilterType
    case "RateLimit":
        return RateLimitFilterType
    case "Auth":
        return AuthFilterType
    case "AddHeader":
        return AddHeaderFilterType
     case "RemoveHeader":
        return RemoveHeaderFilterType
    case "AddRequestParam":return  AddRequestParamFilterType
     case "RewritePath":return  RewritePathFilterType
    case "SetPath":
        return SetPathFilterType
    case "StripPrefix":
        return StripPrefixFilterType
    case "PrefixPath":
        return PrefixPathFilterType
    case "RedirectTo":
        return RedirectToFilterType
    case "SetStatus":
        return SetStatusFilterType
    case "ModifyResponseBody":
        return ModifyResponseBodyFilterType
    case "ModifyRequestBody":
        return ModifyRequestBodyFilterType
    case "CorsWebFilter":
        return CorsWebFilterType
    case "MapRequestHeader":
        return MapRequestHeaderFilterType
    case "PreserveHostHeader":
        return PreserveHostHeaderFilterType
    case "RequestSize":
        return RequestSizeFilterType
    default:
        return UnknownFilter
    }
}
