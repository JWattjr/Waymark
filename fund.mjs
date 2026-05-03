import { Ed25519Account, Network } from '@aptos-labs/ts-sdk';
import { ShelbyClient } from '@shelby-protocol/sdk/node';

async function main() {
  const client = new ShelbyClient({ network: Network.SHELBYNET });
  const account = Ed25519Account.generate();
  console.log('Generated:', account.privateKey.toString());
  try {
    await client.fundAccountWithAPT({ address: account.accountAddress, amount: 500000000 });
    await client.fundAccountWithShelbyUSD({ address: account.accountAddress, amount: 500000000 });
    console.log('Funded successfully!');
  } catch(e) {
    console.error(e.message);
  }
}
main();
