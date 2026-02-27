import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfService } from '../services/rdf.service';
import { Chart } from 'chart.js/auto';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef;

  patentes: any[] = [];
  colunas: string[] = ['numero', 'titulo', 'ano', 'ipc'];

  totalPatentes = 0;
  anoMaisAntigo: any = '-';
  anoMaisRecente: any = '-';
  decadaMaisProdutiva: any = '-';
  ipcMaisFrequente: any = '-';

  modoGrafico: 'ANO' | 'DECADA' = 'ANO';

  private chart: any;

  constructor(private rdfService: RdfService) {}

  ngOnInit(): void {
    this.carregarLista();
  }

  // ==========================
  // NORMALIZA JSON-LD
  // ==========================
  private normalizeJsonLd(data: any[]): any[] {

    return data
      .filter((item: any) =>
        item['@type']?.includes('http://example.org/pedido-patente/PedidoPatente')
      )
      .map((item: any) => {

        const dataDeposito =
          item['http://example.org/pedido-patente/dataDoPrimeiroDeposito']?.[0]?.['@value'] || null;

        let anoExtraido: number | null = null;

        if (dataDeposito && dataDeposito.length >= 4) {
          anoExtraido = parseInt(dataDeposito.substring(0, 4));
        }

        return {
          numero: item['http://example.org/pedido-patente/numeroDoPedido']?.[0]?.['@value'] || '-',
          titulo: item['http://example.org/pedido-patente/titulo']?.[0]?.['@value'] || '-',
          ipc: item['http://example.org/pedido-patente/classificacaoIPC']?.[0]?.['@value'] || '-',
          ano: anoExtraido
        };
      });
  }

  // ==========================
  // CARREGAR DADOS
  // ==========================
  carregarLista() {
    this.rdfService.getPatentes().subscribe((res) => {

      const graph = Array.isArray(res) ? res : res['@graph'] || [];

      this.patentes = this.normalizeJsonLd(graph);

      this.totalPatentes = this.patentes.length;

      this.calcularMetricas();
    });
  }

  // ==========================
  // MÉTRICAS
  // ==========================
  calcularMetricas() {

    const anos = this.patentes
      .map(p => p.ano)
      .filter(a => a !== null)
      .sort((a, b) => a - b);

    if (anos.length > 0) {
      this.anoMaisAntigo = anos[0];
      this.anoMaisRecente = anos[anos.length - 1];
    }

    const contagemDecada: any = {};
    const contagemIPC: any = {};

    this.patentes.forEach(p => {

      if (p.ano) {
        const decada = Math.floor(p.ano / 10) * 10;
        contagemDecada[decada] = (contagemDecada[decada] || 0) + 1;
      }

      if (p.ipc) {
        contagemIPC[p.ipc] = (contagemIPC[p.ipc] || 0) + 1;
      }
    });

    this.decadaMaisProdutiva = this.getMaior(contagemDecada);
    this.ipcMaisFrequente = this.getMaior(contagemIPC);
  }

  private getMaior(obj: any) {
    let maior = '-';
    let max = 0;

    for (const chave in obj) {
      if (obj[chave] > max) {
        max = obj[chave];
        maior = chave + ' (' + obj[chave] + ')';
      }
    }

    return maior;
  }

  // ==========================
  // GRÁFICO
  // ==========================
  mostrarGrafico(tipo: 'ANO' | 'DECADA') {

    this.modoGrafico = tipo;

    const contagem: any = {};

    this.patentes.forEach(p => {

      if (!p.ano) return;

      if (tipo === 'ANO') {
        contagem[p.ano] = (contagem[p.ano] || 0) + 1;
      } else {
        const decada = Math.floor(p.ano / 10) * 10;
        contagem[decada] = (contagem[decada] || 0) + 1;
      }
    });

    const labels = Object.keys(contagem).sort();
    const valores = labels.map(l => contagem[l]);

    setTimeout(() => {

      if (!this.graficoCanvas) return;

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.graficoCanvas.nativeElement.getContext('2d');

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: tipo === 'ANO' ? 'Patentes por Ano' : 'Patentes por Década',
              data: valores
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

    }, 200);
  }
}
