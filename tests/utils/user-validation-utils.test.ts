import { describe, it, expect } from 'vitest';
import { isUserEmailOk } from '@/utils/user-validation-utils';

describe('isUserEmailOk', () => {
    describe('valid emails', () => {
        it('should return true for standard email format', () => {
            expect(isUserEmailOk('user@example.com')).toBe(true);
        });

        it('should return true for email with subdomain', () => {
            expect(isUserEmailOk('user@mail.example.com')).toBe(true);
        });

        it('should return true for email with dots in local part', () => {
            expect(isUserEmailOk('first.last@example.com')).toBe(true);
        });

        it('should return true for email with plus sign', () => {
            expect(isUserEmailOk('user+tag@example.com')).toBe(true);
        });

        it('should return true for email with numbers', () => {
            expect(isUserEmailOk('user123@example123.com')).toBe(true);
        });

        it('should return true for email with hyphen in domain', () => {
            expect(isUserEmailOk('user@my-domain.com')).toBe(true);
        });

        it('should return true for email with long TLD', () => {
            expect(isUserEmailOk('user@example.technology')).toBe(true);
        });

        it('should return true for email with IP address domain', () => {
            expect(isUserEmailOk('user@[192.168.1.1]')).toBe(true);
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

        it('should return false for email with spaces', () => {
            expect(isUserEmailOk('user name@example.com')).toBe(false);
        });

        it('should return false for email with multiple @ symbols', () => {
            expect(isUserEmailOk('user@@example.com')).toBe(false);
        });

        it('should return false for email without TLD', () => {
            expect(isUserEmailOk('user@example')).toBe(false);
        });

        it('should return false for email with spaces in local part', () => {
            expect(isUserEmailOk('user name@example.com')).toBe(false);
        });

        it('should return false for email ending with dot', () => {
            expect(isUserEmailOk('user@example.com.')).toBe(false);
        });

        it('should return false for email starting with dot', () => {
            expect(isUserEmailOk('.user@example.com')).toBe(false);
        });

        it('should return false for plain text', () => {
            expect(isUserEmailOk('not an email')).toBe(false);
        });

        it('should return false for email with consecutive dots', () => {
            expect(isUserEmailOk('user..name@example.com')).toBe(false);
        });
    });
});
