class CalculadoraOrcamentista {
    constructor() {
        this.produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        const form = document.getElementById('productForm');
        form.addEventListener('submit', (e) => this.addProduto(e));
        
        document.getElementById('limparBtn').addEventListener('click', () => this.limparTodos());
        
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim();
            this.render();
        });
    }

    addProduto(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const custoDireto = parseFloat(document.getElementById('custoDireto').value);
        const outrosCustos = parseFloat(document.getElementById('outrosCustos').value);
        const margemDesejada = parseFloat(document.getElementById('margemDesejada').value) / 100;

        if (!nome || custoDireto < 0 || outrosCustos < 0 || margemDesejada < 0 || margemDesejada >= 1) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        const custoTotal = custoDireto + outrosCustos;
        const precoVenda = custoTotal / (1 - margemDesejada);
        const lucro = precoVenda - custoTotal;

        const produto = {
            id: Date.now(),
            nome,
            custoDireto,
            outrosCustos,
            custoTotal,
            margemDesejada,
            precoVenda,
            lucro
        };

        this.produtos.unshift(produto);
        this.searchTerm = '';
        document.getElementById('searchInput').value = '';
        this.save();
        this.render();
        this.limparForm();
    }

    limparTodos() {
        if (confirm('Tem certeza que deseja limpar todos os produtos?')) {
            this.produtos = [];
            this.searchTerm = '';
            document.getElementById('searchInput').value = '';
            this.save();
            this.render();
        }
    }

    deleteProduto(id) {
        this.produtos = this.produtos.filter(p => p.id !== id);
        this.searchTerm = '';
        document.getElementById('searchInput').value = '';
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('produtos', JSON.stringify(this.produtos));
    }

    limparForm() {
        document.getElementById('productForm').reset();
        document.getElementById('outrosCustos').value = '0';
    }

    calcularResumo() {
        const total = this.produtos.reduce((acc, p) => ({
            custoTotal: acc.custoTotal + p.custoTotal,
            precoVenda: acc.precoVenda + p.precoVenda,
            lucro: acc.lucro + p.lucro,
            count: acc.count + 1
        }), { custoTotal: 0, precoVenda: 0, lucro: 0, count: 0 });

        if (total.count === 0) return null;

        return {
            ...total,
            margemMedia: total.lucro / total.precoVenda * 100
        };
    }

    render() {
        this.renderTabela();
        this.renderResumo();
    }

    getProdutosFiltrados() {
        if (!this.searchTerm) return this.produtos;
        return this.produtos.filter(p => 
            p.nome.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    renderTabela() {
        const tbody = document.querySelector('#productTable tbody');
        tbody.innerHTML = '';

        const produtosFiltrados = this.getProdutosFiltrados();
        produtosFiltrados.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>R$ ${produto.custoDireto.toFixed(2)}</td>
                <td>R$ ${produto.outrosCustos.toFixed(2)}</td>
                <td class="custo-total">R$ ${produto.custoTotal.toFixed(2)}</td>
                <td class="margem">${(produto.margemDesejada * 100).toFixed(1)}%</td>
                <td class="preco-venda">R$ ${produto.precoVenda.toFixed(2)}</td>
                <td class="lucro">R$ ${produto.lucro.toFixed(2)}</td>
                <td><button class="btn-delete" onclick="calculadora.deleteProduto(${produto.id})">🗑️</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    renderResumo() {
        const summary = document.getElementById('summary');
        const resumo = this.calcularResumo();

        if (!resumo) {
            summary.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
            return;
        }

        summary.innerHTML = `
            <h3>📊 Resumo Geral (${resumo.count} produtos)</h3>
            <div>
                <strong>Custo Total:</strong> R$ ${resumo.custoTotal.toFixed(2)} |
                <strong>Faturamento:</strong> R$ ${resumo.precoVenda.toFixed(2)} |
                <strong>Lucro Total:</strong> R$ ${resumo.lucro.toFixed(2)} |
                <strong>Margem Média:</strong> ${(resumo.margemMedia).toFixed(1)}%
            </div>
        `;
    }
}

// Inicializar app
const calculadora = new CalculadoraOrcamentista();
