import ollama
import os
import json
import logging
import tools

logging.basicConfig(level=logging.INFO)

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = "llama3.2:3b"

def pull_model_if_missing(client, model):
    try:
        client.show(model)
    except ollama.ResponseError as e:
        status = e.status_code
        if status == 404:
            logging.info(f"Pulling model {model}. This might take a while...")
            client.pull(model)
        else:
            logging.error(f"Error checking model: {e}")

def run_agent_loop(user_message: str):
    client = ollama.Client(host=OLLAMA_HOST)
    pull_model_if_missing(client, MODEL_NAME)

    messages = [
        {"role": "system", "content": "You are an intelligent Multimodal Agent. You answer user queries based on a knowledge base of uploaded documents. If you need to find something, ALWAYS use 'search_knowledge_base'. If you want to see what documents exist, use 'list_documents'. You can call tools multiple times until you understand the full context."},
        {"role": "user", "content": user_message}
    ]
    
    traces = []
    
    for iteration in range(7):
        logging.info(f"Agent Loop Iteration {iteration + 1}")
        
        response = client.chat(
            model=MODEL_NAME,
            messages=messages,
            tools=tools.tools_list
        )
        
        msg = response['message']
        messages.append(msg)
        
        if msg.get('tool_calls'):
            for tcall in msg['tool_calls']:
                # The tcall is typically a dict in ollama-python
                tool_name = tcall['function']['name']
                tool_args = tcall['function']['arguments']
                traces.append({"tool": tool_name, "input": tool_args})
                
                logging.info(f"Executing tool {tool_name} with args {tool_args}")
                result = tools.execute_tool(tcall)
                
                traces.append({"tool": tool_name, "output": result})
                
                messages.append({
                    "role": "tool",
                    "content": str(result)
                })
        else:
            final_answer = msg.get('content', '')
            return {
                "answer": final_answer,
                "traces": traces,
                "iterations": iteration + 1
            }
            
    return {
        "answer": "Reached maximum iteration limit of 7 without finishing.",
        "traces": traces,
        "iterations": 7
    }
