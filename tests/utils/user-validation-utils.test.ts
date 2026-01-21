import { describe, it, expect } from 'vitest';
import { isUserEmailOk } from '@/utils/user-validation-utils';

describe('isUserEmailOk', () => {
    describe('valid emails', () => {
        it('should return true for a simple valid email', () => {
            expect(isUserEmailOk('user@example.com')).toBe(true);
        });

        it('should return true for email with dots in local part', () => {
            expect(isUserEmailOk('user.name@example.com')).toBe(true);
        });

        it('should return true for email with plus sign', () => {
            expect(isUserEmailOk('user+tag@example.com')).toBe(true);
        });

        it('should return true for email with subdomain', () => {
            expect(isUserEmailOk('user@mail.example.com')).toBe(true);
        });

        it('should return true for email with multiple subdomains', () => {
            expect(isUserEmailOk('user@mail.server.example.com')).toBe(true);
        });

        it('should return true for email with numbers', () => {
            expect(isUserEmailOk('user123@example456.com')).toBe(true);
        });

        it('should return true for email with hyphens in domain', () => {
            expect(isUserEmailOk('user@ex-ample.com')).toBe(true);
        });

        it('should return true for email with longer TLD', () => {
            expect(isUserEmailOk('user@example.technology')).toBe(true);
        });
    });

    describe('invalid emails', () => {
        it('should return false for empty string', () => {
            expect(isUserEmailOk('')).toBe(false);
        });

        it('should return false for email without @', () => {
            expect(isUserEmailOk('userexample.com')).toBe(false);
        });

        it('should return false for email without domain', () => {
            expect(isUserEmailOk('user@')).toBe(false);
        });

        it('should return false for email without local part', () => {
            expect(isUserEmailOk('@example.com')).toBe(false);
        });

        it('should return false for email without TLD', () => {
            expect(isUserEmailOk('user@example')).toBe(false);
        });

        it('should return false for email with spaces', () => {
            expect(isUserEmailOk('user name@example.com')).toBe(false);
        });

        it('should return false for email with multiple @', () => {
            expect(isUserEmailOk('user@@example.com')).toBe(false);
        });

        it('should return false for email with special characters', () => {
            expect(isUserEmailOk('user#name@example.com')).toBe(false);
        });

        it('should return false for email starting with dot', () => {
            expect(isUserEmailOk('.user@example.com')).toBe(false);
        });

        it('should return false for email ending with dot before @', () => {
            expect(isUserEmailOk('user.@example.com')).toBe(false);
        });

        it('should return false for domain starting with hyphen', () => {
            expect(isUserEmailOk('user@-example.com')).toBe(false);
        });

        it('should return false for domain ending with hyphen', () => {
            expect(isUserEmailOk('user@example-.com')).toBe(false);
        });

        it('should return false for email with only spaces', () => {
            expect(isUserEmailOk('   ')).toBe(false);
        });

        it('should return false for single character TLD', () => {
            expect(isUserEmailOk('user@example.c')).toBe(false);
        });
    });
});
