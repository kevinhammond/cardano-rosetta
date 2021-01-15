import CardanoWasm, { StakeCredential } from 'cardano-serialization-lib';
import { Logger } from 'fastify';
import { NetworkIdentifier, AddressPrefix, StakeAddressPrefix, NonStakeAddressPrefix } from '../constants';

/**
 * Returns the bech-32 address prefix based on the netowrkId
 * Prefix according to: https://github.com/cardano-foundation/CIPs/blob/master/CIP-0005/CIP-0005.md
 * @param network number
 * @param addressPrefix the corresponding prefix enum. Defaults to non stake address prefixes
 */
export const getAddressPrefix = (network: number, addressPrefix: AddressPrefix = NonStakeAddressPrefix): string =>
  network === NetworkIdentifier.CARDANO_MAINNET_NETWORK ? addressPrefix.MAIN : addressPrefix.TEST;

/**
 * Creates a new Reward address
 * @param logger
 * @param network
 * @param paymentCredential
 */
export const generateRewardAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential
): string => {
  logger.info('[generateRewardAddress] Deriving cardano reward address from valid public staking key');
  const rewardAddress = CardanoWasm.RewardAddress.new(network, paymentCredential);
  const bech32address = rewardAddress.to_address().to_bech32(getAddressPrefix(network, StakeAddressPrefix));
  logger.info(`[generateRewardAddress] reward address is ${bech32address}`);
  return bech32address;
};

/**
 * Creates a new Base address
 * @param logger
 * @param network
 * @param paymentCredential
 * @param stakingCredential
 */
export const generateBaseAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential,
  stakingCredential: StakeCredential
): string => {
  logger.info('[generateAddress] Deriving cardano address from valid public key and staking key');
  const baseAddress = CardanoWasm.BaseAddress.new(network, paymentCredential, stakingCredential);
  const bech32address = baseAddress.to_address().to_bech32(getAddressPrefix(network));
  logger.info(`[generateAddress] base address is ${bech32address}`);
  return bech32address;
};

/**
 * Creates a new Enterprise Address
 * @param logger
 * @param network
 * @param paymentCredential
 */
export const generateEnterpriseAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential
): string => {
  // Enterprise address - default scenario
  logger.info('[generateAddress] Deriving cardano enterprise address from valid public key');
  const enterpriseAddress = CardanoWasm.EnterpriseAddress.new(network, paymentCredential);
  const bech32enterpriseAddress = enterpriseAddress.to_address().to_bech32(getAddressPrefix(network));
  logger.info(`[generateAddress] enterprise address is ${bech32enterpriseAddress}`);
  return bech32enterpriseAddress;
};
