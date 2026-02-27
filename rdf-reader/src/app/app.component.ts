import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfService } from './services/rdf.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DashboardComponent,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatGridListModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  patentes: any[] = [];
  totalPatentes = 0;

  constructor(private rdfService: RdfService) {}

  ngOnInit(): void {
    this.rdfService.getRdf().subscribe(res => {

      const graph = res['@graph'] || [];

      this.patentes = graph
        .filter((p: any) => p['ex:numeroDoPedido'])
        .map((p: any) => ({
          numero: p['ex:numeroDoPedido']?.[0]?.['@value'],
          titulo: p['ex:titulo']?.[0]?.['@value'],
          data: p['ex:dataDoPrimeiroDeposito']?.[0]?.['@value'],
          ipc: p['ex:classificacaoIPC']?.[0]?.['@value']
        }));

      this.totalPatentes = this.patentes.length;
    });
  }
}
