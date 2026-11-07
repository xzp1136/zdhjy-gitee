async function call(name, args = {}) {
 const response = await fetch(process.env.COCOS_MCP_URL || 'http://127.0.0.1:8765/', {
  method: 'POST', headers: {'Content-Type':'application/json', Accept:'application/json, text/event-stream'},
  body: JSON.stringify({jsonrpc:'2.0', id:1, method:'tools/call', params:{name, arguments:args}}),
 });
 const result = await response.json();
 if (result.error) throw Error(JSON.stringify(result.error));
 const value = result.result.structuredContent;
 if (!value?.ok || value.data?.ok === false) {
  const error = Error(name + ': ' + (value?.data?.message || value?.summary || JSON.stringify(result).slice(0,1000)));
  error.data = value?.data;
  throw error;
 }
 return value.data;
}
module.exports = {call};
if (require.main === module) call(process.argv[2], JSON.parse(process.argv[3] || '{}')).then(v=>console.log(JSON.stringify(v))).catch(e=>{console.error(e);process.exitCode=1;});
