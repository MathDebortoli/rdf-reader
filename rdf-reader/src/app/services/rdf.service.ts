import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RdfService {

  private repository = 'teste-db';
  private endpoint = `http://localhost:7200/repositories/${this.repository}`;

  constructor(private http: HttpClient) {}

  getRdf(): Observable<any> {

    const query = `
      PREFIX ex: <http://example.org/pedido-patente/>

      SELECT ?pedido ?propriedade ?valor
      WHERE {
        ?pedido a ex:PedidoPatente .
        ?pedido ?propriedade ?valor .
      }
      LIMIT 100
    `;

    const encodedQuery = encodeURIComponent(query);

    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json'
    });

    return this.http.get(
      `${this.endpoint}?query=${encodedQuery}`,
      { headers }
    );
  }
}
