import * as process from 'process';

export const configuration = () => ({
  serverPort: process.env.PORT,

  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    logging: false,
    entities: ['dist/**/*.entity{.ts,.js}']
  },

  jwt: {
    secret: process.env.JWT_ACCESS_SECRET,
    signOptions: { expiresIn: process.env.EXPIRES_IN }
  },

  marketplaceBackendUrl: process.env.MARKETPLACES_BACKEND_URL
});
