import json
with open(r"C:\\Users\\bruno\\Documents\\Trendly\\Claude Code\\Foquinha Ai\\Docs\\Codex\\assistente_dev_pessoal_workflow.json","r",encoding="utf-8") as f:
    data=json.load(f)
for node in data.get('nodes', []):
    params=node.get('parameters',{})
    for key,val in params.items():
        if isinstance(val, dict) and 'parameter' in val and not isinstance(val['parameter'], list):
            print('node', node.get('name'), 'param', key, 'type', type(val['parameter']))
