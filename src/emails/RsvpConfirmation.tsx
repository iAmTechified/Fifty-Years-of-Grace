import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Link,
    Hr,
    Tailwind
} from '@react-email/components';
import * as React from 'react';

interface RsvpConfirmationEmailProps {
    fullName: string;
    guestsCount: number;
}

export const RsvpConfirmationEmail = ({
    fullName = 'Guest',
    guestsCount = 0,
}: RsvpConfirmationEmailProps) => {
    const previewText = `We've received your RSVP`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Fifty Years of Grace</Heading>
                    <Text style={text}>
                        Dear {fullName},
                    </Text>
                    <Text style={text}>
                        Thank you for responding to our invitation. We have received your RSVP for the celebration.
                    </Text>
                    <Section style={details}>
                        <Text style={paragraph}>
                            <strong>Status:</strong> Pending Confirmation<br />
                            <strong>Guests:</strong> {guestsCount > 0 ? guestsCount + 1 : 1}
                        </Text>
                    </Section>
                    <Text style={text}>
                        We verify the details pending approval. You will receive another email once your attendance is confirmed.
                    </Text>
                    <Hr style={hr} />
                    <Text style={footer}>
                        If you have any questions, please contact us.
                    </Text>
                </Container>
            </Body>
            </Tailwind>
        </Html>
    );
};

export default RsvpConfirmationEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#D4AF37', // Gold-ish color to match theme
    fontFamily: 'serif',
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#333333',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#333333',
};

const details = {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    margin: '20px 0',
};

const hr = {
    borderColor: '#cccccc',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
};
