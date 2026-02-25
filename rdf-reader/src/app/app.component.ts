import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfService } from './services/rdf.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], // 👈 IMPORTANTE
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  rdfData: any;

  constructor(private rdfService: RdfService) {}

  ngOnInit(): void {
    this.rdfService.getRdf().subscribe(data => {
      this.rdfData = data;
    });
  }
}
