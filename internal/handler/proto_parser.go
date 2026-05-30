package handler

import (
	"encoding/base64"
	"math"

	"google.golang.org/protobuf/encoding/protowire"
)

// parseProtoFields parses raw protobuf bytes into a map
func parseProtoFields(data []byte) map[string]interface{} {
	result := make(map[string]interface{})
	fieldCounts := make(map[uint64]int)

	for len(data) > 0 {
		num, wtype, n := protowire.ConsumeTag(data)
		if n < 0 {
			break
		}
		data = data[n:]

		fieldKey := uint64(num)
		fieldCounts[fieldKey]++

		switch wtype {
		case protowire.VarintType:
			val, n := protowire.ConsumeVarint(data)
			if n < 0 {
				return result
			}
			data = data[n:]
			setField(result, fieldKey, fieldCounts[fieldKey], decodeVarint(val))

		case protowire.Fixed32Type:
			val, n := protowire.ConsumeFixed32(data)
			if n < 0 {
				return result
			}
			data = data[n:]
			setField(result, fieldKey, fieldCounts[fieldKey], math.Float32frombits(val))

		case protowire.Fixed64Type:
			val, n := protowire.ConsumeFixed64(data)
			if n < 0 {
				return result
			}
			data = data[n:]
			setField(result, fieldKey, fieldCounts[fieldKey], math.Float64frombits(val))

		case protowire.BytesType:
			val, n := protowire.ConsumeBytes(data)
			if n < 0 {
				return result
			}
			data = data[n:]

			// Try to parse as nested message
			nested := parseProtoFields(val)
			if len(nested) > 0 && isValidNestedMessage(val) {
				setField(result, fieldKey, fieldCounts[fieldKey], nested)
			} else {
				// Treat as string
				str := string(val)
				if isPrintable(str) {
					setField(result, fieldKey, fieldCounts[fieldKey], str)
				} else {
					setField(result, fieldKey, fieldCounts[fieldKey], base64.StdEncoding.EncodeToString(val))
				}
			}

		default:
			// Skip unknown wire types
			return result
		}
	}

	return result
}

func setField(result map[string]interface{}, fieldNum uint64, count int, value interface{}) {
	key := fieldNumToKey(fieldNum)

	if count > 1 {
		// Convert to array
		existing, ok := result[key]
		if ok {
			arr, isArr := existing.([]interface{})
			if isArr {
				result[key] = append(arr, value)
			} else {
				result[key] = []interface{}{existing, value}
			}
		} else {
			result[key] = value
		}
	} else {
		result[key] = value
	}
}

func fieldNumToKey(num uint64) string {
	// Map common field numbers to readable names
	// This is a generic mapping - in production you'd use proto descriptors
	switch num {
	case 1:
		return "id"
	case 2:
		return "field_2"
	case 3:
		return "field_3"
	case 4:
		return "field_4"
	case 5:
		return "field_5"
	case 6:
		return "field_6"
	case 7:
		return "field_7"
	case 8:
		return "field_8"
	case 9:
		return "field_9"
	case 10:
		return "field_10"
	case 11:
		return "field_11"
	case 12:
		return "field_12"
	case 13:
		return "field_13"
	case 14:
		return "field_14"
	case 15:
		return "field_15"
	default:
		return "field_" + string(rune('0'+num%10))
	}
}

func decodeVarint(val uint64) interface{} {
	if val == 0 {
		return false
	}
	if val == 1 {
		return true
	}
	// Check if it's a signed int (zigzag)
	if val > math.MaxInt32 {
		return int64(val)
	}
	return int64(val)
}

func isPrintable(s string) bool {
	for _, r := range s {
		if r < 32 || r > 126 {
			if r != '\n' && r != '\r' && r != '\t' {
				return false
			}
		}
	}
	return true
}

func isValidNestedMessage(data []byte) bool {
	// Quick check: try to parse and see if all fields are valid
	if len(data) < 2 {
		return false
	}
	num, wtype, n := protowire.ConsumeTag(data)
	if n < 0 || num == 0 || num > 100 {
		return false
	}
	_ = wtype
	return true
}
