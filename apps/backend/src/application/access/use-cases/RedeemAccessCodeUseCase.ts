import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';

export interface RedeemResult {
  granted: boolean;
}

@injectable()
export class RedeemAccessCodeUseCase {
  constructor(
    @inject(TOKENS.IAccessCodeVerifier)
    private readonly verifier: IAccessCodeVerifier
  ) {}

  async execute(code: string): Promise<RedeemResult> {
    const granted = await this.verifier.verify(code);
    return { granted };
  }
}
