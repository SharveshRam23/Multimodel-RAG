import json
import rag

search_knowledge_base_def = {
    "type": "function",
    "function": {
        "name": "search_knowledge_base",
        "description": "Searches the vector database for relevant information across all uploaded documents. Use this whenever you need to find facts, summarize content, or answer questions based on the user's data.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query, should be a natural language question or keyword set."}
            },
            "required": ["query"]
        }
    }
}

list_documents_def = {
    "type": "function",
    "function": {
        "name": "list_documents",
        "description": "Lists all documents currently available in the knowledge base, returning their filename, type, and upload time.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
}

tools_list = [search_knowledge_base_def, list_documents_def]

def execute_tool(tool_call):
    # Handle dict or object
    if isinstance(tool_call, dict):
        name = tool_call['function']['name']
        args = tool_call['function']['arguments']
    else:
        name = tool_call.function.name
        args = tool_call.function.arguments

    if isinstance(args, str):
        args = json.loads(args)
    
    if name == "search_knowledge_base":
        query = args.get("query", "")
        results = rag.retrieve_chunks(query, top_k=3)
        if not results:
            return "No relevant information found."
        formatted = ""
        for i, res in enumerate(results):
            formatted += f"[Source: {res['filename']}]\n{res['content']}\n\n"
        return formatted
        
    elif name == "list_documents":
        docs = rag.get_all_documents()
        if not docs:
            return "No documents available."
        formatted = ""
        for d in docs:
            formatted += f"- {d['filename']} ({d['type']}) uploaded at {d['upload_time']}\n"
        return formatted
        
    else:
         return f"Unknown tool: {name}"
