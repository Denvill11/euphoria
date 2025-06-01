import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as express from 'express';

@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const uploadsPath = path.join(__dirname, '../../..', 'uploads');
    console.log('Serving static files from: ', uploadsPath);

    express.static(uploadsPath)(req, res, next);
  }
}
