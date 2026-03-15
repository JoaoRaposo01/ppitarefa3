const empresas = [];

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const dados = {};
      const partes = body.split("&");

      for (let i = 0; i < partes.length; i++) {
        const item = partes[i].split("=");
        const chave = decodeURIComponent(item[0] || "").replace(/\+/g, " ");
        const valor = decodeURIComponent(item[1] || "").replace(/\+/g, " ");
        dados[chave] = valor;
      }

      resolve(dados);
    });
  });
}

function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie || "";
  const lista = cookieHeader.split(";");

  for (let i = 0; i < lista.length; i++) {
    const partes = lista[i].trim().split("=");
    if (partes[0]) {
      cookies[partes[0]] = partes[1];
    }
  }

  return cookies;
}

function layout(titulo, conteudo) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>${titulo}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f4f4f4;
      }

      nav {
        background: #333;
        padding: 15px;
      }

      nav a {
        color: white;
        text-decoration: none;
        margin-right: 15px;
      }

      .container {
        width: 90%;
        max-width: 900px;
        margin: 20px auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
      }

      h1, h2 {
        margin-top: 0;
      }

      input {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        box-sizing: border-box;
      }

      button {
        padding: 10px 15px;
        cursor: pointer;
      }

      .erro {
        color: red;
        margin-bottom: 15px;
      }

      .sucesso {
        color: green;
        margin-bottom: 15px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      table, th, td {
        border: 1px solid #ccc;
      }

      th, td {
        padding: 8px;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/cliente">Cadastro de Cliente</a>
      <a href="/fornecedor">Cadastro de Fornecedor</a>
      <a href="/login">Login</a>
      <a href="/logout">Logout</a>
    </nav>

    <div class="container">
      ${conteudo}
    </div>
  </body>
  </html>
  `;
}

function paginaHome() {
  return layout(
    "Home",
    `
      <h1>Sistema Simples</h1>
      <p>Bem-vindo ao sistema.</p>
      <p>Use o menu para navegar entre as páginas.</p>
    `
  );
}

function paginaCliente() {
  return layout(
    "Cliente",
    `
      <h1>Cadastro de Cliente</h1>
      <p>Página apenas para constar no menu.</p>
    `
  );
}

function paginaLogin(mensagem) {
  return layout(
    "Login",
    `
      <h1>Login</h1>
      ${mensagem ? <p class="${mensagem.tipo}">${mensagem.texto}</p> : ""}
      <form method="POST" action="/login">
        <label>Usuário</label>
        <input type="text" name="usuario">

        <label>Senha</label>
        <input type="password" name="senha">

        <button type="submit">Entrar</button>
      </form>

      <p><strong>Usuário de teste:</strong> admin</p>
      <p><strong>Senha de teste:</strong> 123</p>
    `
  );
}

function tabelaEmpresas() {
  if (empresas.length === 0) {
    return "<p>Nenhuma empresa cadastrada ainda.</p>";
  }

  let linhas = "";

  for (let i = 0; i < empresas.length; i++) {
    linhas += `
      <tr>
        <td>${empresas[i].cnpj}</td>
        <td>${empresas[i].razaoSocial}</td>
        <td>${empresas[i].nomeFantasia}</td>
        <td>${empresas[i].cidade}</td>
        <td>${empresas[i].uf}</td>
        <td>${empresas[i].email}</td>
        <td>${empresas[i].telefone}</td>
      </tr>
    `;
  }

  return `
    <table>
      <tr>
        <th>CNPJ</th>
        <th>Razão Social</th>
        <th>Nome Fantasia</th>
        <th>Cidade</th>
        <th>UF</th>
        <th>Email</th>
        <th>Telefone</th>
      </tr>
      ${linhas}
    </table>
  `;
}

function paginaFornecedor(mensagem, dados) {
  dados = dados || {};

  return layout(
    "Cadastro de Fornecedor",
    `
      <h1>Cadastro de Fornecedor</h1>
      ${mensagem ? <p class="${mensagem.tipo}">${mensagem.texto}</p> : ""}

      <form method="POST" action="/fornecedor">
        <label>CNPJ</label>
        <input type="text" name="cnpj" value="${dados.cnpj || ""}">

        <label>Razão Social ou Nome do Fornecedor</label>
        <input type="text" name="razaoSocial" value="${dados.razaoSocial || ""}">

        <label>Nome Fantasia</label>
        <input type="text" name="nomeFantasia" value="${dados.nomeFantasia || ""}">

        <label>Endereço</label>
        <input type="text" name="endereco" value="${dados.endereco || ""}">

        <label>Cidade</label>
        <input type="text" name="cidade" value="${dados.cidade || ""}">

        <label>UF</label>
        <input type="text" name="uf" value="${dados.uf || ""}">

        <label>CEP</label>
        <input type="text" name="cep" value="${dados.cep || ""}">

        <label>Email</label>
        <input type="text" name="email" value="${dados.email || ""}">

        <label>Telefone</label>
        <input type="text" name="telefone" value="${dados.telefone || ""}">

        <button type="submit">Cadastrar</button>
      </form>

      <h2>Empresas cadastradas</h2>
      ${tabelaEmpresas()}
    `
  );
}

module.exports = async (req, res) => {
  const url = req.url.split("?")[0];
  const metodo = req.method;
  const cookies = parseCookies(req);

  if (url === "/" && metodo === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(paginaHome());
    return;
  }

  if (url === "/cliente" && metodo === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(paginaCliente());
    return;
  }

  if (url === "/login" && metodo === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(paginaLogin());
    return;
  }

  if (url === "/login" && metodo === "POST") {
    const dados = await parseBody(req);

    if (dados.usuario === "admin" && dados.senha === "123") {
      res.statusCode = 200;
      res.setHeader("Set-Cookie", "logado=sim; Path=/");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        paginaLogin({
          tipo: "sucesso",
          texto: "Login realizado com sucesso!"
        })
      );
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        paginaLogin({
          tipo: "erro",
          texto: "Usuário ou senha inválidos!"
        })
      );
    }
    return;
  }

  if (url === "/logout" && metodo === "GET") {
    res.statusCode = 200;
    res.setHeader("Set-Cookie", "logado=; Path=/; Max-Age=0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      layout(
        "Logout",
        `
          <h1>Logout</h1>
          <p class="sucesso">Logout efetuado com sucesso!</p>
        `
      )
    );
    return;
  }

  if (url === "/fornecedor" && metodo === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (cookies.logado !== "sim") {
      res.end(
        paginaFornecedor({
          tipo: "erro",
          texto: "Você pode cadastrar mesmo sem bloquear, mas o login/logout já está implementado."
        })
      );
    } else {
      res.end(paginaFornecedor());
    }
    return;
  }

  if (url === "/fornecedor" && metodo === "POST") {
    const dados = await parseBody(req);

    const campos = [
      { nome: "cnpj", label: "CNPJ" },
      { nome: "razaoSocial", label: "Razão Social ou Nome do Fornecedor" },
      { nome: "nomeFantasia", label: "Nome Fantasia" },
      { nome: "endereco", label: "Endereço" },
      { nome: "cidade", label: "Cidade" },
      { nome: "uf", label: "UF" },
      { nome: "cep", label: "CEP" },
      { nome: "email", label: "Email" },
      { nome: "telefone", label: "Telefone" }
    ];

    const erros = [];

    for (let i = 0; i < campos.length; i++) {
      const valor = dados[campos[i].nome];

      if (!valor || valor.trim() === "") {
        erros.push(campos[i].label);
      }
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (erros.length > 0) {
      res.end(
        paginaFornecedor(
          {
            tipo: "erro",
            texto: "Os seguintes campos são obrigatórios: " + erros.join(", ")
          },
          dados
        )
      );
      return;
    }

    empresas.push({
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

    res.end(
      paginaFornecedor({
        tipo: "sucesso",
        texto: "Fornecedor cadastrado com sucesso!"
      })
    );
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(
    layout(
      "Página não encontrada",
      `
        <h1>404</h1>
        <p>Página não encontrada.</p>
      `
    )
  );
};