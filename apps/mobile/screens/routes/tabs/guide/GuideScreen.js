import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../../../../constants/AppTheme';
import { Card } from '../../../../components/common/Card';
import { HeaderBackButton } from '../../../../components/common/HeaderBackButton';
import { BookOpen } from 'lucide-react-native';
import { guideService } from '../../../../services/guide.service';
import { MENU_BAR_CONTENT_PADDING } from '../../../../constants/menu-bar';

export default function GuideScreen() {
  const [guide, setGuide] = useState({ title: 'Buku Panduan', subtitle: '', sections: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await guideService.get();
        setGuide(res || { title: 'Buku Panduan', subtitle: '', sections: [] });
      } catch (_e) {}
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: MENU_BAR_CONTENT_PADDING }}>
      <Stack.Screen options={{ title: 'Panduan Operasional', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} />
      <View style={styles.header}><BookOpen size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} /><Text style={styles.title}>{guide.title || 'Buku Panduan'}</Text><Text style={styles.subtitle}>{guide.subtitle || 'Panduan operasional unit.'}</Text></View>
      <View style={styles.content}>{(guide.sections || []).map((section, idx) => <Card style={styles.card} key={section.id || idx}><Text style={styles.chapterTitle}>{section.title}</Text>{section.summary ? <Text style={[styles.paragraph, { marginBottom: theme.spacing.sm }]}>{section.summary}</Text> : null}<Text style={styles.paragraph}>{section.body || ''}</Text></Card>)}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.surface }, header: { padding: theme.spacing.xl, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border }, title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.xs }, subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 }, content: { padding: theme.spacing.md }, card: { padding: theme.spacing.lg, marginBottom: theme.spacing.md }, chapterTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm }, paragraph: { ...theme.typography.body, color: theme.colors.textSecondary, lineHeight: 24 } });
