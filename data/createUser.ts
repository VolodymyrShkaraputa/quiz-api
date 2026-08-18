import { quizAnswers } from './quizAnswers';

export type CreateUserData = {
    name: string;
    phone: string;
    password: string;
};

function generatePhone(): string {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`
        .slice(-9);

    return `+38067${suffix}`;
}

function generatePassword(): string {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    return `Qa_${suffix}!`;
}

export function createUserData(): CreateUserData {
    return {
        name: 'Charlie API Test',
        phone: generatePhone(),
        password: generatePassword(),
    };
}

export function buildCreateUserPayload(
    user: CreateUserData,
) {
    return {
        data: {
            type: 'users',

            attributes: {
                name: user.name,
                password: user.password,
                phone: user.phone,

                flags: {
                    is_viewing_subscriptions: 1,
                },

                'private-lessons': false,
                picture: null,
                admin: null,

                'time-zone': 'Europe/Kyiv',
                lang: 'uk',
                'lesson-duration': 30,

                'is-password-gen': false,

                'teach-languages': [],
                'native-languages': [],
                'speak-languages': [],

                subjects: ['en'],

                'tutor-locales': [],
                accents: [],

                'give-homework': false,
                'use-old-price': false,
                'reg-from-landing': false,

                partner: false,

                'is-chat2desk-client-id': false,
                'is-renew-student': false,

                'is-subscription': false,
                'is-unlimited-subscription': false,

                'is-adult': false,
                'is-teach-adults': false,

                'is-tutor-accredited': false,

                'use-separated-balances': false,
                'from-permanent-schedule': false,
                'returned-student': false,

                'origin-lang': 'uk',

                utm_source: {
                    src: `${process.env.API_BASE_URL}/uk/app/sign-up/long/charlie/age-range`,
                    utm_funnel: 'sign-up.long.charlie',
                },
            },

            relationships: {
                'user-metum': {
                    data: {
                        type: 'user-meta',

                        attributes: {
                            about: null,
                            'user-id': null,

                            expirience: null,
                            'about-video': null,

                            'is-native-lang': false,

                            skype: null,

                            'child-name':
                                quizAnswers.child.name,

                            'child-name-latin': null,

                            'child-age':
                                quizAnswers.child.age,

                            'student-age-from': null,
                            'student-age-to': null,

                            comment: null,

                            'price-1h-rub': null,
                            'price-30m-rub': null,

                            'old-price-1h-rub': null,
                            'old-price-30m-rub': null,

                            currency: null,

                            'cost-1h': null,
                            'conversion-bonus': null,

                            'cost-30m': null,

                            'cost-trial-1h': null,
                            'cost-trial-30m': null,

                            wallet: null,
                            'wallet-name': null,
                            'wallet-currency': null,
                            'wallet-recipient-id': null,

                            'schedule-updated-at': null,

                            'wishes-for-learning': null,

                            'us-tax-residency': null,
                            'country-of-residency': null,

                            'lesson-date-wishes': null,

                            'tutor-type-wishes':
                                quizAnswers.tutorTypeWishes,

                            'tutor-id-wishes': null,
                            'tutor-accent-wishes': null,

                            'les-cnt-by-invitation': null,

                            'is-loyal': false,

                            'penalty-percents': null,
                            assessment: null,

                            'can-reschedule': false,
                            'can-auto-confirm': null,

                            'cnt-speaking-created-weekly': null,

                            nationality: null,
                            qualifications: [],

                            'tutor-conversion': null,

                            'funnel-data':
                                quizAnswers.funnelData,

                            'can-save-min-working-hours': false,

                            'operating-timezone':
                                'Europe/Kyiv',

                            'min-working-hours': null,
                            'max-working-hours': null,

                            'upsell-fifty-five-banner': false,
                            'upsell-fifty-five-modal': false,

                            'subscription-discount-at': null,
                            'subscription-discount-applied-at':
                                null,

                            'last-hero-src': null,

                            'child-hobby-id': null,

                            subject: 'en',
                        },
                    },
                },
            },
        },
    };
}