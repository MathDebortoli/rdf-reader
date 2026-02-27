import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RdfService {
  private repository = 'teste-db';
  private endpoint = `/repositories/${this.repository}`;

  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/sparql-query',
    Accept: 'application/ld+json',
  });

  // 🔵 MÉTODO BASE
  getRdf(): Observable<any> {
    const query = `
      PREFIX ex: <http://example.org/pedido-patente/>

      CONSTRUCT {
        ?pedido a ex:PedidoPatente ;
                ex:numeroDoPedido ?numero ;
                ex:titulo ?titulo ;
                ex:dataDoPrimeiroDeposito ?data ;
                ex:classificacaoIPC ?ipc .
      }
      WHERE {
        ?pedido a ex:PedidoPatente ;
                ex:numeroDoPedido ?numero ;
                ex:titulo ?titulo ;
                ex:dataDoPrimeiroDeposito ?data ;
                ex:classificacaoIPC ?ipc .
      }
      LIMIT 500
    `;

    return this.http.post(this.endpoint, query, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getPatentes(): Observable<any> {
    return this.getRdf();
  }

  getPatentesPorAno(): Observable<any> {
    const query = `
      PREFIX ex: <http://example.org/pedido-patente/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      CONSTRUCT {
        _:estatistica ex:ano ?ano ;
                      ex:quantidade ?total .
      }
      WHERE {
        SELECT ?ano (COUNT(?pedido) AS ?total)
        WHERE {
          ?pedido a ex:PedidoPatente ;
                  ex:dataDoPrimeiroDeposito ?data .

          BIND (YEAR(xsd:date(?data)) AS ?ano)
        }
        GROUP BY ?ano
        ORDER BY ?ano
      }
    `;

    return this.http.post(this.endpoint, query, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
