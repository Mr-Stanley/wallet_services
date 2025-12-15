import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app';

describe('Wallet API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /wallets', () => {
    it('should create a wallet', () => {
      return request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet1', currency: 'USD' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBe('wallet1');
          expect(res.body.currency).toBe('USD');
          expect(res.body.balance).toBe(0);
        });
    });

    it('should return 409 if wallet already exists', async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet2', currency: 'USD' });

      return request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet2', currency: 'USD' })
        .expect(409);
    });
  });

  describe('POST /wallets/:id/fund', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet3', currency: 'USD' });
    });

    it('should fund a wallet', () => {
      return request(app.getHttpServer())
        .post('/wallets/wallet3/fund')
        .send({ amount: 100 })
        .expect(200)
        .expect((res) => {
          expect(res.body.balance).toBe(100);
        });
    });

    it('should return 404 if wallet not found', () => {
      return request(app.getHttpServer())
        .post('/wallets/nonexistent/fund')
        .send({ amount: 100 })
        .expect(404);
    });

    it('should validate amount is positive', () => {
      return request(app.getHttpServer())
        .post('/wallets/wallet3/fund')
        .send({ amount: -10 })
        .expect(400);
    });
  });

  describe('POST /wallets/transfer', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet4', currency: 'USD' });
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet5', currency: 'USD' });
      await request(app.getHttpServer())
        .post('/wallets/wallet4/fund')
        .send({ amount: 100 });
    });

    it('should transfer funds between wallets', () => {
      return request(app.getHttpServer())
        .post('/wallets/transfer')
        .send({
          fromWalletId: 'wallet4',
          toWalletId: 'wallet5',
          amount: 50,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.fromWallet.balance).toBe(50);
          expect(res.body.toWallet.balance).toBe(50);
        });
    });

    it('should return 400 if insufficient balance', () => {
      return request(app.getHttpServer())
        .post('/wallets/transfer')
        .send({
          fromWalletId: 'wallet4',
          toWalletId: 'wallet5',
          amount: 200,
        })
        .expect(400);
    });
  });

  describe('GET /wallets/:id', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/wallets')
        .send({ id: 'wallet6', currency: 'USD' });
      await request(app.getHttpServer())
        .post('/wallets/wallet6/fund')
        .send({ amount: 75 });
    });

    it('should return wallet details with transactions', () => {
      return request(app.getHttpServer())
        .get('/wallets/wallet6')
        .expect(200)
        .expect((res) => {
          expect(res.body.wallet).toBeDefined();
          expect(res.body.wallet.id).toBe('wallet6');
          expect(res.body.wallet.balance).toBe(75);
          expect(res.body.transactions).toBeDefined();
          expect(res.body.transactions.length).toBeGreaterThan(0);
        });
    });

    it('should return 404 if wallet not found', () => {
      return request(app.getHttpServer())
        .get('/wallets/nonexistent')
        .expect(404);
    });
  });
});
