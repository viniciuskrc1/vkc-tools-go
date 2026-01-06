export namespace main {
	
	export class AuthResult {
	    success: boolean;
	    token?: string;
	    error?: string;
	    expiresAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new AuthResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.token = source["token"];
	        this.error = source["error"];
	        this.expiresAt = source["expiresAt"];
	    }
	}
	export class WorkflowResult {
	    service: string;
	    success: boolean;
	    message: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new WorkflowResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.service = source["service"];
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	    }
	}
	export class BatchResult {
	    total: number;
	    succeeded: number;
	    failed: number;
	    results: WorkflowResult[];
	
	    static createFrom(source: any = {}) {
	        return new BatchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.succeeded = source["succeeded"];
	        this.failed = source["failed"];
	        this.results = this.convertValues(source["results"], WorkflowResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DocumentResult {
	    raw: string;
	    formatted: string;
	    valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DocumentResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.raw = source["raw"];
	        this.formatted = source["formatted"];
	        this.valid = source["valid"];
	    }
	}
	export class GHStatus {
	    installed: boolean;
	    authenticated: boolean;
	    user?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new GHStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.authenticated = source["authenticated"];
	        this.user = source["user"];
	        this.error = source["error"];
	    }
	}
	export class HistoryEntry {
	    id: string;
	    // Go type: time
	    timestamp: any;
	    type: string;
	    jdkVersion?: string;
	    environment?: string;
	    services: string[];
	    version: string;
	    succeeded: number;
	    failed: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new HistoryEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.type = source["type"];
	        this.jdkVersion = source["jdkVersion"];
	        this.environment = source["environment"];
	        this.services = source["services"];
	        this.version = source["version"];
	        this.succeeded = source["succeeded"];
	        this.failed = source["failed"];
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SavedCompanyID {
	    id: string;
	    name: string;
	    companyId: string;
	    createdAt: string;
	    lastUsed?: string;
	
	    static createFrom(source: any = {}) {
	        return new SavedCompanyID(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.companyId = source["companyId"];
	        this.createdAt = source["createdAt"];
	        this.lastUsed = source["lastUsed"];
	    }
	}
	export class SavedLogin {
	    id: string;
	    name: string;
	    username: string;
	    password: string;
	    createdAt: string;
	    lastUsed?: string;
	
	    static createFrom(source: any = {}) {
	        return new SavedLogin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.createdAt = source["createdAt"];
	        this.lastUsed = source["lastUsed"];
	    }
	}
	export class SessionInfo {
	    success: boolean;
	    error?: string;
	    companyId?: string;
	    contactId?: string;
	    contabilFirmId?: string;
	
	    static createFrom(source: any = {}) {
	        return new SessionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	        this.companyId = source["companyId"];
	        this.contactId = source["contactId"];
	        this.contabilFirmId = source["contabilFirmId"];
	    }
	}

}

