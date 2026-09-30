import {
  client,
  methods,
  type Client,
  type ClientConnection,
  type Stream,
} from '@agentclientprotocol/sdk';
import {
  CRYON_EXT_AGENT_REQUESTS,
  CRYON_EXT_NOTIFICATIONS,
  CryonExtClient,
  type CryonSessionNotification_unstable,
  type ProviderDeviceCodeNotification_unstable,
  type RecipeParamsResponse_unstable,
  type RequestRecipeParams_unstable,
  zCryonSessionNotification_unstable,
  zProviderDeviceCodeNotification_unstable,
  zRequestRecipeParams_unstable,
} from '@aaif/cryon-acp-client';

const [cryonSessionUpdate, providerDeviceCode] = CRYON_EXT_NOTIFICATIONS;
const [cryonRecipeParamsRequest] = CRYON_EXT_AGENT_REQUESTS;

export type CryonAcpCallbacks = Required<
  Pick<Client, 'requestPermission' | 'sessionUpdate' | 'createElicitation'>
> & {
  unstable_sessionRecipeRequestParams: (
    request: RequestRecipeParams_unstable
  ) => Promise<RecipeParamsResponse_unstable>;
  unstable_sessionUpdate: (notification: CryonSessionNotification_unstable) => Promise<void>;
  unstable_providerDeviceCode: (
    notification: ProviderDeviceCodeNotification_unstable
  ) => Promise<void>;
};

export type CryonAcpClient = {
  connection: ClientConnection;
  cryon: CryonExtClient;
};

export function connectCryonAcpClient(
  stream: Stream,
  callbacks: CryonAcpCallbacks
): CryonAcpClient {
  const app = client({ name: 'cryon' })
    .onRequest(methods.client.session.requestPermission, (context) =>
      callbacks.requestPermission(context.params)
    )
    .onNotification(methods.client.session.update, (context) =>
      callbacks.sessionUpdate(context.params)
    )
    .onRequest(methods.client.elicitation.create, (context) =>
      callbacks.createElicitation(context.params)
    )
    .onRequest(cryonRecipeParamsRequest.method, zRequestRecipeParams_unstable, (context) =>
      callbacks.unstable_sessionRecipeRequestParams(context.params)
    )
    .onNotification(cryonSessionUpdate.method, zCryonSessionNotification_unstable, (context) =>
      callbacks.unstable_sessionUpdate(context.params)
    )
    .onNotification(
      providerDeviceCode.method,
      zProviderDeviceCodeNotification_unstable,
      (context) => callbacks.unstable_providerDeviceCode(context.params)
    );

  const connection = app.connect(stream);
  const cryon = new CryonExtClient(connection.agent);

  return { connection, cryon };
}
