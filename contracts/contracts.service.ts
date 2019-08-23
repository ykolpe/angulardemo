import { Injectable, Inject  } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppSettings } from '../app.settings';
import { environment } from '../environment';


export class ApprovalRoute {
  code: string;
  description: string;
}

export class LOB {
  value: string;
  label: string;
  example: string;
  constructor(value: string, label: string, example: string) {
    this.value = value;
    this.label = label;
    this.example = example;
  }
}

export class Contract {
  TransactionID: string;
  ContractNumber: string;
  ContractTitle: string;
  ReqNumber: string;
  PoNumber: string;
  TransactionType: string;
  TransactionNumber: string;
  Description: string;
  Status: string;
  TotalAmount: number;
  ContractAmount: number; //REVIEW not list in api
  ContingencyAmount: number;
  GLDate: Date; //REVIEW DatePrinted: Date;
  SysItemType: string;
}

export interface SendToEOneResponseMessageDTO {
    ResponseCode: string;
    ResponseMessage: string;
    DetailMessage: string;
    ExceptionThrown: any;
}

export interface ContractTransactionsResponse {
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    ContractTransactionsList: Contract[];
}


@Injectable()
export class ContractsService {

    reportIds = environment.reportIds;

  constructor(
      private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

    query = (page: number): Observable<ContractTransactionsResponse> => {
        // let contract = new Contract();
        // contract.ContractNumber = "C123";
        // contract.TransactionNumber = "0123";
        // contract.ContractNumber = "aContract";
        // contract.TransactionID = 'ABCD-1234';
        // contract.SysItemType = 'CO';
        // return new Observable((s => s.next([contract])));

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let mapper = (res: Response) => {
            let body = res.json();
            return body || [];
        }
        return this.http.get(`${this.originUrl}/ctrx/api/${page.toString()}`) //this.http.get("/ctrx/api")
            .map(mapper)
            .catch(this.handleError);
    }

    sendToE1 = (contract: Contract): Observable<SendToEOneResponseMessageDTO> => {

        console.log("TransactionID : " + contract.TransactionID + " System Type : " + contract.SysItemType)
      return this.http.post(`${this.originUrl}/ctrx/api?transactionId=${contract.TransactionID}&systemItemType=${contract.SysItemType}`, {})
        //return this.http.post(`${this.originUrl}/ctrx/api/${contract.TransactionID}/${contract.SysItemType}`, {})
      .map((resp: Response) => resp)
      .catch(this.handleError);
  }

  viewReport = (trx: Contract): Observable<string> => {
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

      console.log("SAP", job, features);

      window.open(job, 'ReportViewerWindow', features);
      return new Observable(s => s.next("success?"));
  }

  generateContractNumber = (selected: LOB): Observable<string> => {
    return this.http.get(`${this.originUrl}/ctrx/max-contract-number`, { params: { lob: selected.value } })
      .map((resp: Response) => { console.log(resp.json); return "C" + (parseInt(resp.text()) + 1) })
      .catch(this.handleError);
  }

  saveContractNumber = (): Observable<string> => {
    return null
  }

  approvalRoutes = (): Observable<ApprovalRoute[]> => {
    let mapper = (res: Response) => {
      let body = res.json();
      return body || [];
    }
    return this.http.get("lookup-approval-path/query")
      .map(mapper)
      .catch(this.handleError);
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

  getReportID(sysItemType: string): string {
      return this.reportIds[sysItemType];
  }
}
