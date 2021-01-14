/* eslint-disable camelcase */
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { FastifyInstance } from 'fastify';
import { setupOfflineDatabase, setupServer } from '../utils/test-utils';
import {
  CONSTRUCTION_INVALID_TRANSACTION,
  constructionParseOperations,
  CONSTRUCTION_PAYLOADS_REQUEST,
  CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION,
  CONSTRUCTION_SIGNED_TX_WITH_REGISTRATION_AND_WITHDRWAWAL_AND_EXTRA_DATA,
  CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_DEREGISTRATION,
  CONSTRUCTION_PAYLOADS_WITH_STAKE_REGISTRATION_AND_DELEGATION,
  CONSTRUCTION_PAYLOADS_WITH_STAKE_DELEGATION,
  CONSTRUCTION_PAYLOADS_WITH_WITHDRAWAL,
  CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION_AND_WITHDRAWAL,
  CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_RESPONSE,
  CONSTRUCTION_PAYLOADS_STAKE_DEREGISTRATION_RESPONSE,
  CONSTRUCTION_PAYLOADS_STAKE_DELEGATION_RESPONSE,
  CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_AND_DELEGATION_RESPONSE,
  CONSTRUCTION_PAYLOADS_WITHDRAWAL_RESPONSE,
  CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_AND_WITHDRAWAL_RESPONSE,
  CONSTRUCTION_SIGNED_TRANSACTION_WITH_EXTRA_DATA,
  CONSTRUCTION_SIGNED_TX_WITH_REGISTRATION_AND_EXTRA_DATA,
  CONSTRUCTION_UNSIGNED_TRANSACTION_WITH_EXTRA_DATA
} from '../fixture-data';

const CONSTRUCTION_PARSE_ENDPOINT = '/construction/parse';

const generateParsePayload = (blockchain: string, network: string, signed: boolean, transaction: string) => ({
  network_identifier: { blockchain, network },
  signed,
  transaction
});

describe(CONSTRUCTION_PARSE_ENDPOINT, () => {
  let database: Pool;
  let server: FastifyInstance;

  beforeAll(async () => {
    database = setupOfflineDatabase();
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });
  test('Should return 1 input, 2 outputs and signers if a valid signed transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', true, CONSTRUCTION_SIGNED_TRANSACTION_WITH_EXTRA_DATA)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(constructionParseOperations(CONSTRUCTION_PAYLOADS_REQUEST));
    expect(response.json().signers).toEqual([CONSTRUCTION_PAYLOADS_REQUEST.operations[0].account?.address]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key registration and signers with payment and stake addresses', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', true, CONSTRUCTION_SIGNED_TX_WITH_REGISTRATION_AND_EXTRA_DATA)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION)
    );
    expect(response.json().signers).toEqual([
      CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION.operations[0].account?.address,
      'stake1uxa5pudxg77g3sdaddecmw8tvc6hmynywn49lltt4fmvn7caek7a5'
    ]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key registration, 1 withdrawal and signers addresses should be unique ', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload(
        'cardano',
        'mainnet',
        true,
        CONSTRUCTION_SIGNED_TX_WITH_REGISTRATION_AND_WITHDRWAWAL_AND_EXTRA_DATA
      )
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION_AND_WITHDRAWAL)
    );
    expect(response.json().signers).toEqual([
      CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION_AND_WITHDRAWAL.operations[0].account?.address,
      'stake1uxa5pudxg77g3sdaddecmw8tvc6hmynywn49lltt4fmvn7caek7a5'
    ]);
  });

  test('Should return 1 input, 2 outputs and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_UNSIGNED_TRANSACTION_WITH_EXTRA_DATA)
    });

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(constructionParseOperations(CONSTRUCTION_PAYLOADS_REQUEST));
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key registration and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_RESPONSE)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION)
    );
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key deregistration and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_PAYLOADS_STAKE_DEREGISTRATION_RESPONSE)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_DEREGISTRATION)
    );
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake delegation and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_PAYLOADS_STAKE_DELEGATION_RESPONSE)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_DELEGATION)
    );
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key registration, 1 stake delegation and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload(
        'cardano',
        'mainnet',
        false,
        CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_AND_DELEGATION_RESPONSE
      )
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_REGISTRATION_AND_DELEGATION)
    );
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 withdrawal and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_PAYLOADS_WITHDRAWAL_RESPONSE)
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_WITHDRAWAL));
    expect(response.json().signers).toEqual([]);
  });

  // eslint-disable-next-line max-len
  test('Should return 1 input, 2 outputs, 1 stake key registration, 1 withdrawal and empty signers if a valid unsigned transaction is set', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload(
        'cardano',
        'mainnet',
        false,
        CONSTRUCTION_PAYLOADS_STAKE_REGISTRATION_AND_WITHDRAWAL_RESPONSE
      )
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json().operations).toEqual(
      constructionParseOperations(CONSTRUCTION_PAYLOADS_WITH_STAKE_KEY_REGISTRATION_AND_WITHDRAWAL)
    );
    expect(response.json().signers).toEqual([]);
  });

  test('Should throw an error when invalid signed transaction bytes are provided', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', true, CONSTRUCTION_INVALID_TRANSACTION)
    });
    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual({
      code: 4011,
      message: 'Cant create signed transaction from transaction bytes',
      retriable: false
    });
  });

  test('Should throw an error when invalid unsigned transaction bytes are provided', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_INVALID_TRANSACTION)
    });
    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual({
      code: 4012,
      message: 'Cant create unsigned transaction from transaction bytes',
      retriable: false
    });
  });

  test('Should throw an error when valid unsigned transaction bytes but signed flag is true are provided', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', true, CONSTRUCTION_UNSIGNED_TRANSACTION_WITH_EXTRA_DATA)
    });
    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual({
      code: 4011,
      message: 'Cant create signed transaction from transaction bytes',
      retriable: false
    });
  });

  test('Should throw an error when valid signed transaction bytes but signed flag is false are provided', async () => {
    const response = await server.inject({
      method: 'post',
      url: CONSTRUCTION_PARSE_ENDPOINT,
      payload: generateParsePayload('cardano', 'mainnet', false, CONSTRUCTION_SIGNED_TRANSACTION_WITH_EXTRA_DATA)
    });
    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual({
      code: 4012,
      message: 'Cant create unsigned transaction from transaction bytes',
      retriable: false
    });
  });
});
