import { Injectable, Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppSettings } from '../app.settings';
import { environment } from '../environment';

export class ContractByProject {
  ContractMasterKey: string = "";
  ContingencyContractMasterKey: string = "";
  ContractNumber: string = "";
  ProjectNumber: string = "";
  MergedMasterKeys: string = "";
  ContractShellNumber: string = "";
  //transactions: Transaction[] = [];
}

export class Contract {
    ContractMasterKey: string = "";
    ContingencyContractMasterKey: string = "";
    ContractNumber: string = "";
    ProjectNumber: string = "";
    EOnePONumber: number = 0;
    EOneReqNumber: number = 0;
}
export class Transaction {
  transactionType: string;
  transactionNumber: string;
  contractTitle: string;
  status: string;
  createDate: string;
  contractAmount: number;
  contingencyAmount: number;
  totalAmount: number;
  IsPrintEnabled: boolean;
  IsRevalidateEnabled: boolean;
  IsErrorsButtonEnabled: boolean;
  ErrorsButtonTooltip: string;
  TrueIndex: number;
}

export class PrintedTransaction {

    vendorInvoiceNumber: string;
    vendorNumber: string;
    transactionType: string;
    PoNumber: string;
    ReqNumber: string;
    gLDate: Date;
    CreatedDate: string;
    HasE1Impact: boolean;
    vendorName: string;
    isValid: boolean;
    description: string;
    transactionID: string;
    integrationStatus: string;
    expeditionStatus: string;
    projectName: string;
    contractTitle: string;
    contractNumber: string;
    totalAmount: number;
    contingencyAmount: number;
    createdBy: string;
    transactionNumber: string;
    pMCSStatus: number;
    HasInvalidAccounts: boolean;
    HasSupplierManager: boolean;
}


export class PrintResponse {
    Success: boolean;
    Errors: string;
    TransactionID: string;
    TransactionType: string;
    ContractTransactions: Transaction[] = [];
}

export class TransactionErrorsResponse {
    Success: boolean;
    Errors: string[] = [];
    ErrorTransaction: PrintedTransaction;
    HeaderText: string;
}

export class PrintRequest
{
    "ListIndex": Number;
    "ContractMastKey": string;
    "ContractName": string;
	"ProjectName": string;
	"ContractShellNumber": string;
}

export class RevalidateRequest
{
    "ContractMastKey": string;
    "ContractName": string;
	"ProjectName": string;
	"ContractShellNumber": string;
}

export class ProjectTransactionListResponse {
    Contract: Contract;
    TransactionWrappedList: Transaction[] = [];
}

export class ProjectResponse {
	"ProjectNumber": string;
	"ContractShellNumber": string;
}

@Injectable()
export class ProjectControlsService {

    //private auth: Auth;
    //private options = new RequestOptions({ withCredentials = true });
    reportIds = environment.reportIds;


    constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

  testProject = (): Observable<string[]> => {
    return new Observable((s => s.next(["pOne", "pTwo", "pEmpty"])));
  }

  projects = (): Observable<ProjectResponse[]> => {

      let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
      let options = new RequestOptions({ headers: headers, withCredentials: true });


      let mapper = (res: Response) => {
        console.log(res.json());

        let body = res.json();
      //return body ? body.response.projectInfo.projectName.sort((p1, p2) => p1.localeCompare(p2)) : [];
      return body || [];

      }
    console.log("Getting a list of projects");

      return this.http.get(`${this.originUrl}/proj/api`)
      .map(mapper)
      .catch(this.handleError);
  }

  contractsForProject = (project: string): Observable<ContractByProject[]> => {
      let mapper = (res: Response) => {
        console.log(res.json());
      let body = res.json();
      //return body ? body.sort((c1, c2) => c1.m_ContractNumber.localeCompare(c2.m_ContractNumber)) : [];
      return body || [];
      }
    console.log("Getting a list of project contracts");

      return this.http.get(`${this.originUrl}/proj/api/${project}`)
      .map(mapper)
      .catch(this.handleError);
  }

  // testTransactionsForContract = (contract: ContractByProject): Observable<Transaction[]> => {
  //   return new Observable(s => s.next(contract.transactions));
  // }

    transactionsForContract = (contract: ContractByProject): Observable<ProjectTransactionListResponse> => {
      let mapper = (res: Response) => {
      let body = res.json();
      return body || [];
		}
		console.log(contract.MergedMasterKeys.trim() + ": " + contract.ContractNumber + ": " + contract.ProjectNumber + ": " + contract.ContractShellNumber);

		return this.http.get(`${this.originUrl}/proj/api/${contract.MergedMasterKeys.trim()}/${contract.ContractNumber}/${contract.ProjectNumber}/${contract.ContractShellNumber}/${0}`)
      .map(mapper)
      .catch(this.handleError);
  }

  print = (index: Number, contract: ContractByProject, transaction: Transaction): Observable<PrintResponse> => {

      let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
      let options = new RequestOptions({ headers: headers});


      let mapper = (res: Response) => {
          let body = <PrintResponse>res.json();
          return body || new PrintResponse;
      }

      let data = new PrintRequest();

      data.ListIndex = index;
      data.ContractMastKey = contract.MergedMasterKeys.trim();
      data.ContractName = contract.ContractNumber;
      data.ProjectName = contract.ProjectNumber;
	  data.ContractShellNumber = contract.ContractShellNumber;

	  console.log(index.toString() + ": " + contract.MergedMasterKeys.trim() + ": " + contract.ContractNumber + ": " + contract.ProjectNumber + ": " + contract.ContractShellNumber);

      let body = JSON.stringify(data);

      return this.http.post(`${this.originUrl}/proj/api/`,body, options)
          .map(mapper)
          .catch(this.handleError);
  }

  revalidate = (index: Number, contract: ContractByProject): Observable<Transaction[]> => {
      let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
      let options = new RequestOptions({ headers: headers });

      let mapper = (res: Response) => {
            let body = res.json();
            return body || [];
      }

      let data = new RevalidateRequest();

      data.ContractMastKey = contract.MergedMasterKeys.trim();
      data.ContractName = contract.ContractNumber;
	  data.ProjectName = contract.ProjectNumber;
	  data.ContractShellNumber = contract.ContractShellNumber;

	  console.log(index.toString() + ": " + contract.MergedMasterKeys.trim() + ": " + contract.ContractNumber + ": " + contract.ProjectNumber + ": " + contract.ContractShellNumber);

      let body = JSON.stringify(data);

      return this.http.post(`${this.originUrl}/proj/api/${index}`, body, options)
            .map(mapper)
            .catch(this.handleError);
    }

  viewReport = (transactionId: string, transactionType: string) => {

      //console.log("This is the transaction and system code: " + trx.transactionID.toString() + " : " + trx.transactionType);

      let job = "https://" + environment.reportServer
          + "/" + "OpenDocument/opendoc/openDocument.aspx"
          + "?isApplication=true"
          + "&sIDType=" + AppSettings.REPORT_OBJECT_ID_TYPE
          + "&iDocID=" + this.getReportID(transactionType)
          + "&" + AppSettings.REPORT_OBJECT_PARAM_TYPE + AppSettings.REPORT_OBJECT_PARAM + "=" + transactionId
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

  errors = (index: Number, contract: ContractByProject): Observable<TransactionErrorsResponse> => {
      let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
      let options = new RequestOptions({ headers: headers });

      let mapper = (res: Response) => {
          let body = res.json();
          return body || [];
      }

      let data = new RevalidateRequest();

      return this.http.get(`${this.originUrl}/proj/api/${index}${contract.MergedMasterKeys.trim()}/${contract.ContractNumber}/${contract.ProjectNumber}`)
          .map(mapper)
          .catch(this.handleError);
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


