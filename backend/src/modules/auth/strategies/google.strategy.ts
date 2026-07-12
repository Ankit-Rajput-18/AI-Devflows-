import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId', 'default-client-id'),
      clientSecret: configService.get<string>('google.clientSecret', 'default-secret'),
      callbackURL: configService.get<string>(
        'google.callbackUrl',
        'http://localhost:4000/api/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      name: name.givenName + ' ' + (name.familyName || ''),
      avatar: photos[0]?.value || null,
      googleId: profile.id,
      accessToken,
    };

    this.logger.log('Google OAuth user: ' + user.email);
    done(null, user);
  }
}
