import { Injectable,Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppSettings } from '../app.settings';
import { environment } from '../environment';


export class AccountsPayable {
    ContingencyAmount: string;
    ContractNumber: string;
    ContractTitle: string;
    Description: string;
    GLDate: Date;
    OnSendToEOneClientClick: string;
    PoNumber: string;
    ReqNumber: string;
    SendCommand: string;
    SendText: string;
    SendToEnterpriseOneConfirmationMessage: string;
    SendToEnterpriseOneEnabled: string;
    SendToEnterpriseOneWaitMessage: string;
    SendTooltip: string;
    Status: string;
    SysItemType: string;
    TotalAmount: number;
    TransactionID: string;
    TransactionNumber: string;
    TransactionType: string;
    VendorInvoiceNumber: string;
    VendorNumber: string;
}

export class AccountsPayableUpdateData {
    TransactionId: string;
    GLDate: Date;
}

export interface SendToEOneResponseMessageDTO
{
    ResponseCode: string;
    ResponseMessage: string;
    DetailMessage: string;
    ExceptionThrown: any;
}

export interface AccountsPayableTransactionsResponse {
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    AccountTransactionsList: AccountsPayable[];
}

export class SendToEOneData {
    TransactionId: string;
    SysItemType: string;
}


const headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': '*',
}

const headerObj = {
    headers: new Headers(headerDict),
}

@Injectable()
export class AccountsPayableService {

    reportIds = environment.reportIds;


	constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }
    

    query = (page: number): Observable<AccountsPayableTransactionsResponse> => {

        try {
            // return new Observable((s => {
            //   let ap = new AccountsPayable();
            //   ap.gldate = new Date();
            //   ap.eonePONumber = "aPO";
            //   ap.contractNumber = "aContract";
            //   s.next([ap])
            // }));

            let mapper = (res: Response) => {
                let body = res.json();
                return body || [];
            }

            //    return this.http.get("accounts-payable-data/query")
            // let headers = new Headers({'Access-Control-Allow-Origin': '*'});
            // let opts =  new RequestOptions({ headers: headers });
            return this.http.get(`${this.originUrl}/accp/api?page=${page.toString()}`)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    get = (transactionID: string): Observable<AccountsPayable> => {
        try {
            // return new Observable((s => {
            //   let ap = new AccountsPayable();
            //   ap.gldate = new Date();
            //   ap.eonePONumber = "aPO";
            //   ap.contractNumber = "aContract";
            //   s.next([ap])
            // }));

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new AccountsPayable();
            }
            //    return this.http.get("accounts-payable-data/query")
            // let headers = new Headers({'Access-Control-Allow-Origin': '*'});
            // let opts =  new RequestOptions({ headers: headers });
            return this.http.get(`${this.originUrl }/accp/api/${transactionID}`)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    update = (ap: AccountsPayable): Observable<AccountsPayable> => {

        try {
            console.log("We are in the rule service method for calling the rest service for updating data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers});

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new AccountsPayable();
            }
            //    return this.http.get("accounts-payable-data/query")
            // let headers = new Headers({'Access-Control-Allow-Origin': '*'});
            // let opts =  new RequestOptions({ headers: headers });

            let updateData = new AccountsPayableUpdateData();

            updateData.TransactionId = ap.TransactionID;
            updateData.GLDate = ap.GLDate;

            let body = JSON.stringify(updateData);

            console.log("This is the value in the body object: " + body);

            console.log("We are calling the rest service for inserting data.");


            return this.http.put(`${this.originUrl }/accp/api`, body, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    viewReport = (ap: AccountsPayable) => {

        //let job = "";
        //this.http.get(`/accp/api/${ap.TransactionID}/${ap.SysItemType}`)
        //    .map((res: Response) => res.text())
        //    .subscribe(
        //        data => {
        //            job = data;
        //            console.log(job.toString());
        //    });

        let job = "https://" + environment.reportServer
            + "/" + "OpenDocument/opendoc/openDocument.aspx"
            + "?isApplication=true"
            + "&sIDType=" + AppSettings.REPORT_OBJECT_ID_TYPE
            + "&iDocID=" + this.getReportID(ap.SysItemType)
            + "&" + AppSettings.REPORT_OBJECT_PARAM_TYPE + AppSettings.REPORT_OBJECT_PARAM + "=" + ap.TransactionID
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

    eone = (ap: AccountsPayable): Observable<Response> => {

        try {

            console.log("We are in the rule service method for calling the rest service for send to eone.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers});

            let mapper = (res: Response) => {
                let body = res;
                return body || [];
            }

            let sendToEone = new SendToEOneData();

            sendToEone.TransactionId = ap.TransactionID;
            sendToEone.SysItemType = ap.SysItemType;

            let body = JSON.stringify(sendToEone);

            //    return this.http.get("accounts-payable-data/query")
            // let headers = new Headers({'Access-Control-Allow-Origin': '*'});
            // let opts =  new RequestOptions({ headers: headers });
            return this.http.post(`${this.originUrl}/accp/api`, body, options)
                .map(mapper)
                .catch(this.handleError);
        } catch (e) {
            alert(e.message);
        }
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

        console.log("we are in the handleErr method,and the error is: " + errMsg);

        return Observable.throw(errMsg);
    }
}
