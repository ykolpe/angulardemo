import { Injectable, Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppSettings } from '../app.settings';
import { environment } from '../environment';

export class RuleChange {
  TransactionID: string;
  PoNumber: string;
  ReqNumber: string;
  ContractNumber: string;
  TransactionType: string;
  TransactionNumber: string;
  Description: string;
  Status: string;
  TotalAmount: number;
  ContingencyAmount: number;
  SysItemType: string;
}

export interface RuleReviewTransactionsResponse {
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    RuleReviewTransactionsList: RuleChange[];
}


@Injectable()
export class RuleChangeReviewService {

    reportIds = environment.reportIds;

    constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

    query(page: number): Observable<RuleReviewTransactionsResponse> {
    // return new Observable((s => {
    //   let ap = new RuleChange();
    //   ap.gldate = new Date();
    //   ap.eonePONumber = "aPO";
    //   ap.contractNumber = "aContract";
    //   s.next([ap])
    // }));

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

    let mapper = (res: Response) => {
      let body = res.json();
      return body || [];
        }
        //return this.http.get(`${this.originUrl}/rules/api?page=${page.toString()}`)
        return this.http.get(`${this.originUrl}/rules/api/${page.toString()}`, options)
      .map(mapper)
      .catch(this.handleError);
  }

  sendToE1 = (trx: RuleChange): Observable<Response> => {
      return this.http.post(`${this.originUrl}/rules/api?transactionId=${trx.TransactionID}&systemItemType=${trx.SysItemType}`, {})
      .map((resp: Response) => resp)
      .catch(this.handleError);
  }

  viewReport = (trx: RuleChange): Observable<string> => {
      let job = "https://" + environment.reportServer
          + "/" + "OpenDocument/opendoc/openDocument.aspx"
          + "?isApplication=true"
          + "&sIDType=" + AppSettings.REPORT_OBJECT_ID_TYPE
          + "&iDocID=" + this.getReportID(trx.SysItemType)
          + "&" + AppSettings.REPORT_OBJECT_PARAM_TYPE + AppSettings.REPORT_OBJECT_PARAM + "=" + trx.TransactionID
          + "&appKind=InfoView&service=%2fOpenDocument%2fappService.aspx";


      let width = AppSettings.REPORT_WINDOW_WIDTH;
      let height = AppSettings.REPORT_WINDOW_HEIGHT;
      let status = AppSettings.REPORT_WINDOW_STATUS;
      let location = AppSettings.REPORT_WINDOW_LOCATION;
      let resizable = AppSettings.REPORT_WINDOW_RESIZABLE;
      let scrollbars = AppSettings.REPORT_WINDOW_SCROLLBARS;

      let features = `'width=${width},height=${height},status=${status},location=${location},resizable=${resizable},scrollbars=${scrollbars}'`;

      console.log(job.toString());

      console.log("SAP", job, features);

      window.open(job, 'ReportViewerWindow', features);
      return new Observable(s => s.next("success?"));
  }

  getReportID(sysItemType: string): string {
      return this.reportIds[sysItemType];
  }

  public handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
