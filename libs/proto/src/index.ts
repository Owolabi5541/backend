import { existsSync } from 'fs';
import { join } from 'path';

function resolveProtoBase() {
  const candidates = [
    join(process.cwd(), 'libs/proto/src/protos'),
    join(__dirname, 'protos'),
  ];

  return candidates.find(existsSync) ?? candidates[0];
}

const protoBase = resolveProtoBase();

export const PROTO_PATHS = {
  user: join(protoBase, 'user.proto'),
  wallet: join(protoBase, 'wallet.proto'),
};
