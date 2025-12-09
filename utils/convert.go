package utils

import "fmt"

func ConvertToStringMap(m map[string]interface{}) map[string]string {
    out := make(map[string]string, len(m))
    for k, v := range m {
        if v == nil {
            out[k] = ""
            continue
        }
        out[k] = fmt.Sprintf("%v", v)
    }
    return out
}

