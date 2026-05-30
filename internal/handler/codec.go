package handler

// rawMessage wraps raw bytes for gRPC codec
type rawMessage struct {
	data []byte
}

// rawCodec is a gRPC codec that passes raw bytes
type rawCodec struct{}

func (rawCodec) Marshal(v interface{}) ([]byte, error) {
	msg, ok := v.(*rawMessage)
	if !ok {
		return nil, nil
	}
	return msg.data, nil
}

func (rawCodec) Unmarshal(data []byte, v interface{}) error {
	msg, ok := v.(*rawMessage)
	if !ok {
		return nil
	}
	msg.data = data
	return nil
}

func (rawCodec) Name() string {
	return "proto"
}
