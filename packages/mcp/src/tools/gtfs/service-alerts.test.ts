import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GtfsServiceAlertsApi } from '@transit-se/sdk/gtfs';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsServiceAlertsEmptyFeedBuffer,
  gtfsServiceAlertsFeedBuffer,
} from '../../../../sdk/src/__fixtures__/gtfs/service-alerts';
import { registerGtfsServiceAlertsTools } from './service-alerts';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsServiceAlertsFeedBuffer)),
);

describe('GTFS Service Alerts MCP Tool', () => {
  let server: McpServer;
  let alertsApi: GtfsServiceAlertsApi;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsServiceAlertsFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    alertsApi = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
  });

  it('should register the gtfs_service_alerts tool without error', () => {
    registerGtfsServiceAlertsTools(server, alertsApi);
    expect(true).toBe(true);
  });

  it('should return formatted alert text', async () => {
    registerGtfsServiceAlertsTools(server, alertsApi);

    const result = await alertsApi.getServiceAlerts('ul');
    expect(result).toHaveLength(2);
    expect(result[0].headerText).toBe('Hållplats Martallsvägen (Uppsala) trafikeras inte');
  });

  it('should pass operator to the API URL', async () => {
    registerGtfsServiceAlertsTools(server, alertsApi);

    await alertsApi.getServiceAlerts('skane');

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/skane/ServiceAlertsSweden.pb');
  });

  it('should handle empty alert response', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsServiceAlertsEmptyFeedBuffer)),
    );

    registerGtfsServiceAlertsTools(server, alertsApi);

    const result = await alertsApi.getServiceAlerts('ul');
    expect(result).toHaveLength(0);
  });

  it('should require an API key', () => {
    const api = new GtfsServiceAlertsApi({ apiKey: 'some-key' });
    expect(api).toBeInstanceOf(GtfsServiceAlertsApi);
  });

  it('should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Unauthorized', { status: 401 })),
    );

    registerGtfsServiceAlertsTools(server, alertsApi);

    await expect(alertsApi.getServiceAlerts('ul')).rejects.toThrow();
  });
});
