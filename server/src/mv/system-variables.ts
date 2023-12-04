import { CompletionItemKind } from 'vscode-languageserver';
import { BaseSystemVariableData, SystemVariableData } from '../util/interfaces';

const baseSystemVariableData: BaseSystemVariableData = {
	kind: CompletionItemKind.Variable
};

const systemVariableData: Record<string, SystemVariableData> = {
	apitype: {
		...baseSystemVariableData,
		label: 'apitype',
		detail: 'API Type',
		documentation: ''
	},
	arg1: {
		...baseSystemVariableData,
		label: 'arg1',
		detail: 'Argument 1',
		documentation: 'Contains the route used for the current page load.'
	},
	arg2: {
		...baseSystemVariableData,
		label: 'arg2',
		detail: 'Argument 2',
		documentation: 'Contains any query parameters appended onto the route.'
	},
	auth_type: {
		...baseSystemVariableData,
		label: 'auth_type',
		detail: '',
		documentation: ''
	},
	callerid: {
		...baseSystemVariableData,
		label: 'callerid',
		detail: '',
		documentation: ''
	},
	callvalue: {
		...baseSystemVariableData,
		label: 'callvalue',
		detail: 'MvCALL Value',
		documentation: 'Value of the current MvCALL response chunk.'
	},
	content_length: {
		...baseSystemVariableData,
		label: 'content_length',
		detail: 'Content-Length Header',
		documentation:
			"References the current page's `Content-Length` header value."
	},
	content_type: {
		...baseSystemVariableData,
		label: 'content_type',
		detail: 'Content-Type Header',
		documentation: "References the current page's `Content-Type` header value."
	},
	content_data: {
		...baseSystemVariableData,
		label: 'content_data',
		detail: 'Content Data',
		documentation: 'The reference to data body sent to the current page request. Used when handling POST requests.'
	},
	document_root: {
		...baseSystemVariableData,
		label: 'document_root',
		detail: 'Document Root',
		documentation: 'The real path to the HTTP root within the filesystem.'
	},
	documenturl: {
		...baseSystemVariableData,
		label: 'documenturl',
		detail: 'Document URL',
		documentation: 'The reference to the URI of the page being requested.'
	},
	dyn_stm_mon: {
		...baseSystemVariableData,
		label: 'dyn_stm_mon',
		detail: 'Local Time: Months',
		documentation: ''
	},
	dyn_stm_wday: {
		...baseSystemVariableData,
		label: 'dyn_stm_wday',
		detail: 'Local Time: Day of Week',
		documentation: ''
	},
	dyn_stm_zone: {
		...baseSystemVariableData,
		label: 'dyn_stm_zone',
		detail: 'Local Time: Timezone',
		documentation: ''
	},
	dyn_time_remaining: {
		...baseSystemVariableData,
		label: 'dyn_time_remaining',
		detail: 'Local Time: Remaining',
		documentation: ''
	},
	dyn_time_t: {
		...baseSystemVariableData,
		label: 'dyn_time_t',
		detail: 'Local Time: Timestamp',
		documentation: ''
	},
	dyn_tm_hour: {
		...baseSystemVariableData,
		label: 'dyn_tm_hour',
		detail: 'Local Time: Hours',
		documentation: ''
	},
	dyn_tm_isdst: {
		...baseSystemVariableData,
		label: 'dyn_tm_isdst',
		detail: 'Local Time: Daylight Savings Time',
		documentation: ''
	},
	dyn_tm_mday: {
		...baseSystemVariableData,
		label: 'dyn_tm_mday',
		detail: 'Local Time: Day of Month',
		documentation: ''
	},
	dyn_tm_min: {
		...baseSystemVariableData,
		label: 'dyn_tm_min',
		detail: 'Local Time: Minutes',
		documentation: ''
	},
	dyn_tm_mon: {
		...baseSystemVariableData,
		label: 'dyn_tm_mon',
		detail: 'Local Time: Months',
		documentation: ''
	},
	dyn_tm_sec: {
		...baseSystemVariableData,
		label: 'dyn_tm_sec',
		detail: 'Local Time: Seconds',
		documentation: ''
	},
	dyn_tm_usec: {
		...baseSystemVariableData,
		label: 'dyn_tm_usec',
		detail: 'Local Time: Milliseconds',
		documentation: ''
	},
	dyn_tm_wday: {
		...baseSystemVariableData,
		label: 'dyn_tm_wday',
		detail: 'Local Time: Day of Week',
		documentation: ''
	},
	dyn_tm_yday: {
		...baseSystemVariableData,
		label: 'dyn_tm_yday',
		detail: 'Local Time: Day of Year',
		documentation: ''
	},
	dyn_tm_year: {
		...baseSystemVariableData,
		label: 'dyn_tm_year',
		detail: 'Local Time: Years',
		documentation: ''
	},
	gateway_interface: {
		...baseSystemVariableData,
		label: 'gateway_interface',
		detail: 'Gateway Interface',
		documentation: 'The configured server gateway.\n\rExample: `CGI/1.1`'
	},
	globaltimeout: {
		...baseSystemVariableData,
		label: 'globaltimeout',
		detail: 'Global Timeout',
		documentation:
			'The configured global timeout for the server in seconds. Used for MVT/Mv script execution.'
	},
	http_accept: {
		...baseSystemVariableData,
		label: 'http_accept',
		detail: 'HTTP-Accept Header',
		documentation: "References the current page's `HTTP-Accept` header value."
	},
	http_accept_encoding: {
		...baseSystemVariableData,
		label: 'http_accept_encoding',
		detail: 'HTTP-Accept-Encoding Header',
		documentation:
			"References the current page's `HTTP-Accept-Encoding` header value."
	},
	http_accept_language: {
		...baseSystemVariableData,
		label: 'http_accept_language',
		detail: 'HTTP-Accept-Language Header',
		documentation:
			"References the current page's `HTTP-Accept-Language` header value."
	},
	http_cache_control: {
		...baseSystemVariableData,
		label: 'http_cache_control',
		detail: 'HTTP-Cache-Control Header',
		documentation:
			"References the current page's `HTTP-Cache-Control` header value."
	},
	http_connection: {
		...baseSystemVariableData,
		label: 'http_connection',
		detail: 'HTTP Connection',
		documentation: 'The HTTP connection type.\r\nExample: `open` or `close`.'
	},
	http_cookie: {
		...baseSystemVariableData,
		label: 'http_cookie',
		detail: 'HTTP Cookie String',
		documentation: "String output of the page's cookies."
	},
	http_host: {
		...baseSystemVariableData,
		label: 'http_host',
		detail: 'HTTP Host',
		documentation:
			'The hostname of the current page.\n\rExample: `www.example.com`'
	},
	http_if_modified_since: {
		...baseSystemVariableData,
		label: 'http_if_modified_since',
		detail: 'HTTP-If-Modified-Since Header',
		documentation:
			"References the current page's `HTTP-If-Modified-Since` header value."
	},
	http_origin: {
		...baseSystemVariableData,
		label: 'http_origin',
		detail: 'HTTP Origin',
		documentation:
			'The origin of the current page. Includes the host and protocol.\n\rExample: `https://www.example.com`'
	},
	http_x_forwarded_proto: {
		...baseSystemVariableData,
		label: 'http_x_forwarded_proto',
		detail: 'HTTP Forwarded Protocol',
		documentation:
			'The protocol of the current page.\n\rExample: `https` or `http`'
	},
	http_referer: {
		...baseSystemVariableData,
		label: 'http_referer',
		detail: 'HTTP Referer',
		documentation: 'The reference to the previously visited URI.'
	},
	http_user_agent: {
		...baseSystemVariableData,
		label: 'http_user_agent',
		detail: 'HTTP-User-Agent Header',
		documentation:
			"References the current page's `HTTP-User-Agent` header value."
	},
	http_x_accel_internal: {
		...baseSystemVariableData,
		label: 'http_x_accel_internal',
		detail: '',
		documentation: ''
	},
	http_x_real_ip: {
		...baseSystemVariableData,
		label: 'http_x_real_ip',
		detail: 'HTTP Real IP Address',
		documentation: 'The IP address of the connected client.'
	},
	miva_charset: {
		...baseSystemVariableData,
		label: 'miva_charset',
		detail: 'Miva: Charset',
		documentation: 'The charset of the current page.'
	},
	miva_config: {
		...baseSystemVariableData,
		label: 'miva_config',
		detail: 'Miva: Config',
		documentation:
			'A structure containing various domain-level configurations for Miva Merchant software.'
	},
	miva_defaultdatabase: {
		...baseSystemVariableData,
		label: 'miva_defaultdatabase',
		detail: 'Miva: Default Database',
		documentation: ''
	},
	miva_defaultlanguage: {
		...baseSystemVariableData,
		label: 'miva_defaultlanguage',
		detail: 'Miva: Default Language',
		documentation: ''
	},
	miva_language: {
		...baseSystemVariableData,
		label: 'miva_language',
		detail: 'Miva: Language',
		documentation: ''
	},
	miva_sslavailable: {
		...baseSystemVariableData,
		label: 'miva_sslavailable',
		detail: 'Miva: SSL Available',
		documentation: ''
	},
	mivaversion: {
		...baseSystemVariableData,
		label: 'mivaversion',
		detail: 'Miva: Version',
		documentation: ''
	},
	nargs: {
		...baseSystemVariableData,
		label: 'nargs',
		detail: '',
		documentation: ''
	},
	path_info: {
		...baseSystemVariableData,
		label: 'path_info',
		detail: '',
		documentation: ''
	},
	path_translated: {
		...baseSystemVariableData,
		label: 'path_translated',
		detail: '',
		documentation: ''
	},
	process_id: {
		...baseSystemVariableData,
		label: 'process_id',
		detail: '',
		documentation: ''
	},
	process_name: {
		...baseSystemVariableData,
		label: 'process_name',
		detail: '',
		documentation: ''
	},
	query_string: {
		...baseSystemVariableData,
		label: 'query_string',
		detail: 'Query String',
		documentation: 'The query parameters for the current page.'
	},
	redirect_query_string: {
		...baseSystemVariableData,
		label: 'redirect_query_string',
		detail: 'Redirect Query String',
		documentation: ''
	},
	redirect_status: {
		...baseSystemVariableData,
		label: 'redirect_status',
		detail: 'Redirect Status Header',
		documentation: 'The `Status` header of the redirected page.'
	},
	redirect_url: {
		...baseSystemVariableData,
		label: 'redirect_url',
		detail: 'Redirect URL',
		documentation:
			'The route redirected page. Same as `s.path_info` and `s.arg1` if not redirected.'
	},
	remote_addr: {
		...baseSystemVariableData,
		label: 'remote_addr',
		detail: 'Remote Address',
		documentation: 'The IP address of the connected client.'
	},
	remote_port: {
		...baseSystemVariableData,
		label: 'remote_port',
		detail: 'Remote Port',
		documentation: 'The port of the connected client.'
	},
	remote_user: {
		...baseSystemVariableData,
		label: 'remote_user',
		detail: '',
		documentation: ''
	},
	request_method: {
		...baseSystemVariableData,
		label: 'request_method',
		detail: '',
		documentation: ''
	},
	request_uri: {
		...baseSystemVariableData,
		label: 'request_uri',
		detail: '',
		documentation: ''
	},
	script_filename: {
		...baseSystemVariableData,
		label: 'script_filename',
		detail: '',
		documentation: ''
	},
	script_name: {
		...baseSystemVariableData,
		label: 'script_name',
		detail: '',
		documentation: ''
	},
	server_addr: {
		...baseSystemVariableData,
		label: 'server_addr',
		detail: '',
		documentation: ''
	},
	server_admin: {
		...baseSystemVariableData,
		label: 'server_admin',
		detail: '',
		documentation: ''
	},
	server_name: {
		...baseSystemVariableData,
		label: 'server_name',
		detail: 'Server Name',
		documentation: 'Same as `s.http_host`.'
	},
	server_port: {
		...baseSystemVariableData,
		label: 'server_port',
		detail: 'Server Port',
		documentation: 'The configured HTTP server port.\n\rExample: `443`'
	},
	server_protocol: {
		...baseSystemVariableData,
		label: 'server_protocol',
		detail: 'Server Protocol',
		documentation:
			'The configured protocol and version for server requests.\n\rExample: `HTTP/1.0`'
	},
	server_software: {
		...baseSystemVariableData,
		label: 'server_software',
		detail: 'Server Software',
		documentation: 'The configured HTTP server software.\n\rExample: `Apache`'
	},
	stm_mon: {
		...baseSystemVariableData,
		label: 'stm_mon',
		detail: 'Server Time: Months',
		documentation: ''
	},
	stm_wday: {
		...baseSystemVariableData,
		label: 'stm_wday',
		detail: 'Server Time: Day of Week',
		documentation: ''
	},
	stm_zone: {
		...baseSystemVariableData,
		label: 'stm_zone',
		detail: 'Server Time: Timezone',
		documentation: ''
	},
	thread_id: {
		...baseSystemVariableData,
		label: 'thread_id',
		detail: '',
		documentation: ''
	},
	time_t: {
		...baseSystemVariableData,
		label: 'time_t',
		detail: 'Server Time: Timestamp',
		documentation: ''
	},
	tm_hour: {
		...baseSystemVariableData,
		label: 'tm_hour',
		detail: 'Server Time: Hours',
		documentation: ''
	},
	tm_isdst: {
		...baseSystemVariableData,
		label: 'tm_isdst',
		detail: 'Server Time: Daylight Savings Time',
		documentation: ''
	},
	tm_mday: {
		...baseSystemVariableData,
		label: 'tm_mday',
		detail: 'Server Time: Day of Month',
		documentation: ''
	},
	tm_min: {
		...baseSystemVariableData,
		label: 'tm_min',
		detail: 'Server Time: Minutes',
		documentation: ''
	},
	tm_mon: {
		...baseSystemVariableData,
		label: 'tm_mon',
		detail: '',
		documentation: ''
	},
	tm_sec: {
		...baseSystemVariableData,
		label: 'tm_sec',
		detail: 'Server Time: Seconds',
		documentation: ''
	},
	tm_usec: {
		...baseSystemVariableData,
		label: 'tm_usec',
		detail: 'Server Time: Milliseconds',
		documentation: ''
	},
	tm_wday: {
		...baseSystemVariableData,
		label: 'tm_wday',
		detail: 'Server Time: Day of Week',
		documentation: ''
	},
	tm_yday: {
		...baseSystemVariableData,
		label: 'tm_yday',
		detail: 'Server Time: Day of Year',
		documentation: ''
	},
	tm_year: {
		...baseSystemVariableData,
		label: 'tm_year',
		detail: 'Server Time: Years',
		documentation: ''
	},
	unique_id: {
		...baseSystemVariableData,
		label: 'unique_id',
		detail: '',
		documentation: ''
	}
};

export default systemVariableData;
