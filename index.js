const http = require("http");
const querystring = require("querystring");

const porta = 3000;

let fornecedores = [];
let logado = false;

function menu() {
  return `
    <a href="/">Home</a> |
    <a href="/cadastroFornecedor">Cadastro de Fornecedor</a> |
    <a href="/login">Login</a> |
    <a href="/logout">Logout</a>
    <hr>
  `;
}

function paginaHome() {
  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Home</title>
      </head>
      <body>
        ${menu()}
        <h1>Home</h1>
        <p>Bem-vindo ao sistema</p>
      </body>
    </html>
  `;
}

function paginaLogin(mensagem) {
  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Login</title>
      </head>
      <body>
        ${menu()}
        <h1>Login</h1>
        <p>${mensagem || ""}</p>

        <form method="POST" action="/login">
          <label>Usuário:</label><br>
          <input type="text" name="usuario"><br><br>

          <label>Senha:</label><br>
          <input type="password" name="senha"><br><br>

          <button type="submit">Entrar</button>
        </form>
      </body>
    </html>
  `;
}

function listaFornecedores() {
  let lista = "<h2>Fornecedores cadastrados</h2>";

  if (fornecedores.length === 0) {
    lista += "<p>Nenhum fornecedor cadastrado.</p>";
  } else {
    lista += "<ul>";
    for (let i = 0; i < fornecedores.length; i++) {
      lista += `
        <li>
          ${fornecedores[i].cnpj} - 
          ${fornecedores[i].razaoSocial} - 
          ${fornecedores[i].nomeFantasia}
        </li>
      `;
    }
    lista += "</ul>";
  }

  return lista;
}

function paginaCadastroFornecedor(mensagem, erros, dados) {
  dados = dados || {};
  erros = erros || [];

  let listaErros = "";
  if (erros.length > 0) {
    listaErros = "<ul>";
    for (let i = 0; i < erros.length; i++) {
      listaErros += <li>${erros[i]}</li>;
    }
    listaErros += "</ul>";
  }

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Cadastro de Fornecedor</title>
      </head>
      <body>
        ${menu()}
        <h1>Cadastro de Fornecedor</h1>

        <p>${mensagem || ""}</p>
        ${listaErros}

        <form method="POST" action="/cadastroFornecedor">
          <label>CNPJ:</label><br>
          <input type="text" name="cnpj" value="${dados.cnpj || ""}"><br><br>

          <label>Razão Social ou Nome do Fornecedor:</label><br>
          <input type="text" name="razaoSocial" value="${dados.razaoSocial || ""}"><br><br>

          <label>Nome fantasia:</label><br>
          <input type="text" name="nomeFantasia" value="${dados.nomeFantasia || ""}"><br><br>

          <label>Endereço:</label><br>
          <input type="text" name="endereco" value="${dados.endereco || ""}"><br><br>

          <label>Cidade:</label><br>
          <input type="text" name="cidade" value="${dados.cidade || ""}"><br><br>

          <label>UF:</label><br>
          <input type="text" name="uf" value="${dados.uf || ""}"><br><br>

          <label>CEP:</label><br>
          <input type="text" name="cep" value="${dados.cep || ""}"><br><br>

          <label>Email:</label><br>
          <input type="text" name="email" value="${dados.email || ""}"><br><br>

          <label>Telefone:</label><br>
          <input type="text" name="telefone" value="${dados.telefone || ""}"><br><br>

          <button type="submit">Cadastrar</button>
        </form>

        ${listaFornecedores()}
      </body>
    </html>
  `;
}

const servidor = http.createServer(function (req, res) {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(paginaHome());
  }

  else if (req.method === "GET" && req.url === "/login") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(paginaLogin(""));
  }

  else if (req.method === "POST" && req.url === "/login") {
    let corpo = "";

    req.on("data", function (parte) {
      corpo += parte;
    });

    req.on("end", function () {
      const dados = querystring.parse(corpo);

      if (dados.usuario === "admin" && dados.senha === "123") {
        logado = true;
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(paginaLogin("Login realizado com sucesso"));
      } else {
        logado = false;
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(paginaLogin("Usuário ou senha inválidos"));
      }
    });
  }

  else if (req.method === "GET" && req.url === "/logout") {
    logado = false;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Logout</title>
        </head>
        <body>
          ${menu()}
          <h1>Logout</h1>
          <p>Logout efetuado com sucesso!</p>
        </body>
      </html>
    `);
  }

  else if (req.method === "GET" && req.url === "/cadastroFornecedor") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(paginaCadastroFornecedor("", [], {}));
  }

  else if (req.method === "POST" && req.url === "/cadastroFornecedor") {
    let corpo = "";

    req.on("data", function (parte) {
      corpo += parte;
    });

    req.on("end", function () {
      const dados = querystring.parse(corpo);
      let erros = [];

      if (!dados.cnpj || dados.cnpj.trim() === "") {
        erros.push("O campo CNPJ não foi preenchido");
      }

      if (!dados.razaoSocial || dados.razaoSocial.trim() === "") {
        erros.push("O campo Razão Social ou Nome do Fornecedor não foi preenchido");
      }

      if (!dados.nomeFantasia || dados.nomeFantasia.trim() === "") {
        erros.push("O campo Nome fantasia não foi preenchido");
      }

      if (!dados.endereco || dados.endereco.trim() === "") {
        erros.push("O campo Endereço não foi preenchido");
      }

      if (!dados.cidade || dados.cidade.trim() === "") {
        erros.push("O campo Cidade não foi preenchido");
      }

      if (!dados.uf || dados.uf.trim() === "") {
        erros.push("O campo UF não foi preenchido");
      }

      if (!dados.cep || dados.cep.trim() === "") {
        erros.push("O campo CEP não foi preenchido");
      }

      if (!dados.email || dados.email.trim() === "") {
        erros.push("O campo Email não foi preenchido");
      }

      if (!dados.telefone || dados.telefone.trim() === "") {
        erros.push("O campo Telefone não foi preenchido");
      }

      if (erros.length > 0) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(paginaCadastroFornecedor("Erro ao cadastrar", erros, dados));
      } else {
        fornecedores.push({
          cnpj: dados.cnpj,
          razaoSocial: dados.razaoSocial,
          nomeFantasia: dados.nomeFantasia,
          endereco: dados.endereco,
          cidade: dados.cidade,
          uf: dados.uf,
          cep: dados.cep,
          email: dados.email,
          telefone: dados.telefone
        });

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(paginaCadastroFornecedor("Fornecedor cadastrado com sucesso", [], {}));
      }
    });
  }

  else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Erro</title>
        </head>
        <body>
          ${menu()}
          <h1>404</h1>
          <p>Página não encontrada</p>
        </body>
      </html>
    `);
  }
});

servidor.listen(porta, function () {
  console.log("Servidor rodando em http://localhost:" + porta);
});