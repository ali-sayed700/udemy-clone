import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { DatabaseService } from './mongo.service';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          // ============= CONNECTION EVENTS (LOGS) =============
          connection.on('connected', () => {
            console.log('🟢 MongoDB Connected Successfully');
          });

          connection.on('error', (err) => {
            console.error('🔴 MongoDB Connection Error:', err);
          });

          connection.on('disconnected', () => {
            console.warn('🟡 MongoDB Disconnected');
          });

          return connection;
        },
        // Retry logic (best practice)
        serverSelectionTimeoutMS: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
})
export class MongoModule {}
