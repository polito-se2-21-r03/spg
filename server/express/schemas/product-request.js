exports.productRequestSchema = {
    "id": "/ProductRequestSchema",
    "type": "object",
    "properties": {
        "producerId": {"type": "integer"},
        "quantity": {"type": "integer"},
        "name": {"type": "string"},
        "unitOfMeasure": {"type": "string"},
        "description": {"type": "string"},
        "src": {"type": "string"},
        "price": {"type": "number"},
        "type": {"type": "string"},
    },
    "required": ["producerId", "quantity", "name", "price", "type"]
};