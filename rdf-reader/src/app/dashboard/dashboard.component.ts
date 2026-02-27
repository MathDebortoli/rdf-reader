import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfService } from '../services/rdf.service';
import { Chart } from 'chart.js/auto';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatGridListModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef;

  patentes: any[] = [];
  anos: number[] = [];
  quantidades: number[] = [];
  totalPatentes = 0;

  modoConsulta: 'LISTA' | 'GRAFICO' = 'LISTA';

  private chart: any;

  constructor(private rdfService: RdfService) {}

  ngOnInit(): void {
    this.carregarLista();
    this.carregarGrafico();
  }

  alternarConsulta(tipo: 'LISTA' | 'GRAFICO') {
    this.modoConsulta = tipo;
  }

  // 🔵 Normaliza JSON-LD vindo como ARRAY
  private normalizeJsonLd(data: any[]): any[] {
    return data.map((item: any) => {
      return {
        numero: item['http://example.org/pedido-patente/numeroDoPedido']?.[0]?.['@value'] || null,
        titulo: item['http://example.org/pedido-patente/titulo']?.[0]?.['@value'] || null,
        data: item['http://example.org/pedido-patente/dataDoPrimeiroDeposito']?.[0]?.['@value'] || null,
        ipc: item['http://example.org/pedido-patente/classificacaoIPC']?.[0]?.['@value'] || null,
        ano: item['http://example.org/pedido-patente/ano']?.[0]?.['@value'] || null,
        quantidade: item['http://example.org/pedido-patente/quantidade']?.[0]?.['@value'] || null
      };
    });
  }

  carregarLista() {
    this.rdfService.getPatentes().subscribe((res) => {

      console.log("RESPOSTA BRUTA:", res);

      // 🔥 AQUI ESTÁ A CORREÇÃO
      const graph = Array.isArray(res) ? res : res['@graph'] || [];

      const data = this.normalizeJsonLd(graph);

      this.patentes = data.filter(p => p.numero !== null);

      this.totalPatentes = this.patentes.length;

      console.log("PATENTES NORMALIZADAS:", this.patentes);
    });
  }

  carregarGrafico() {
    this.rdfService.getPatentesPorAno().subscribe((res) => {

      const graph = Array.isArray(res) ? res : res['@graph'] || [];

      const data = this.normalizeJsonLd(graph);

      this.anos = [];
      this.quantidades = [];

      data.forEach((item: any) => {
        if (item.ano && item.quantidade) {
          this.anos.push(parseInt(item.ano));
          this.quantidades.push(parseInt(item.quantidade));
        }
      });

      setTimeout(() => {
        if (!this.graficoCanvas) return;

        if (this.chart) {
          this.chart.destroy();
        }

        const ctx = this.graficoCanvas.nativeElement.getContext('2d');

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.anos,
            datasets: [
              {
                label: 'Patentes por Ano',
                data: this.quantidades,
                backgroundColor: '#3f51b5',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      }, 200);
    });
  }
}
