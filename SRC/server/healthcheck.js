const http = require("http");

function iniciarHealthcheck() {
  const port = process.env.PORT || 3000;

  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end("Bot online");
    })
    .listen(port, () => {
      console.log(`Servidor HTTP ativo na porta ${port}`);
    });
}

module.exports = {
  iniciarHealthcheck,
};
