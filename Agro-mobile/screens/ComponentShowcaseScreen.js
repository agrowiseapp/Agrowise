import React, { useState } from 'react';
import { Text, Alert } from 'react-native';
import {
  Container,
  ScrollContainer,
  Header,
  Content,
  Row,
  Column,
  Center,
  Spacer,
  Divider,
  Button,
  Card,
  Input,
  theme,
} from '../components/ui';

const ComponentShowcaseScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleButtonPress = (variant) => {
    Alert.alert('Button Pressed', `You pressed the ${variant} button!`);
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Container variant="login">
      <ScrollContainer keyboardAware>
        <Header variant="subscription">
          <Center>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: 'white',
              textAlign: 'center',
            }}>
              🎨 UI Components
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              marginTop: 4,
            }}>
              Showcase of modern components
            </Text>
          </Center>
        </Header>

        <Content variant="form">
          {/* Button Variants */}
          <Text style={styles.sectionTitle}>Buttons</Text>

          <Button
            title="Primary Button"
            variant="primary"
            onPress={() => handleButtonPress('primary')}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Google Sign In"
            variant="google"
            icon="google"
            onPress={() => handleButtonPress('google')}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Secondary Button"
            variant="secondary"
            onPress={() => handleButtonPress('secondary')}
            style={{ marginBottom: 12 }}
          />

          <Row spacing={12}>
            <Button
              title="Loading Demo"
              variant="primary"
              size="small"
              loading={loading}
              onPress={handleLoadingDemo}
              style={{ flex: 1 }}
            />
            <Button
              icon="heart"
              variant="primary"
              size="small"
              onPress={() => handleButtonPress('icon-only')}
            />
          </Row>

          <Spacer size="xl" />

          {/* Input Variants */}
          <Text style={styles.sectionTitle}>Inputs</Text>

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon="email"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            variant="compact"
          />

          <Input
            placeholder="Search something..."
            rightIcon="search"
            helperText="Type to search through items"
          />

          <Spacer size="xl" />

          {/* Card Variants */}
          <Text style={styles.sectionTitle}>Cards</Text>

          <Card
            variant="feature"
            title="Premium Feature"
            description="Get access to exclusive agricultural insights and expert consultations"
            icon="star"
          />

          <Card
            variant="pricing"
            title="€9.99/month"
            subtitle="Premium Subscription"
            onPress={() => Alert.alert('Pricing', 'Navigate to subscription!')}
          >
            <Button
              title="Subscribe Now"
              variant="secondary"
              size="small"
              onPress={() => handleButtonPress('subscribe')}
            />
          </Card>

          <Card
            title="Default Card"
            subtitle="This is a standard card component"
            onPress={() => Alert.alert('Card', 'Card was pressed!')}
          >
            <Text style={{
              color: theme.colors.Text.secondary,
              fontSize: 14,
              lineHeight: 20,
            }}>
              Cards can contain any content including text, images, buttons, and other components.
            </Text>
            <Spacer />
            <Row justify="space-between">
              <Button
                title="Action 1"
                variant="primary"
                size="small"
                onPress={() => {}}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Action 2"
                variant="secondary"
                size="small"
                onPress={() => {}}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </Row>
          </Card>

          <Spacer size="xl" />

          {/* Layout Examples */}
          <Text style={styles.sectionTitle}>Layout Components</Text>

          <Card>
            <Text style={styles.cardTitle}>Row Layout</Text>
            <Row justify="space-between" align="center">
              <Text>Left</Text>
              <Text>Center</Text>
              <Text>Right</Text>
            </Row>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Column Layout</Text>
            <Column spacing={8}>
              <Text>Item 1</Text>
              <Text>Item 2</Text>
              <Text>Item 3</Text>
            </Column>
          </Card>

          <Spacer size="xl" />

          {/* Divider */}
          <Divider text="End of Showcase" />

          <Spacer size="lg" />

          <Center>
            <Text style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              textAlign: 'center',
            }}>
              All components are built with your theme system
            </Text>
          </Center>

          <Spacer size="2xl" />
        </Content>
      </ScrollContainer>
    </Container>
  );
};

const styles = {
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.Text.primary,
    marginBottom: 12,
  },
};

export default ComponentShowcaseScreen;