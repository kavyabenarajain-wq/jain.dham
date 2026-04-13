import { ComingSoon } from '@/components/ComingSoon';
import { useSettingsStore } from '@/stores/settingsStore';

export default function EventsScreen() {
  const { notifyEvents, setNotifyEvents } = useSettingsStore();

  return (
    <ComingSoon
      icon="calendar"
      title="Paryushana & Events"
      description="Festival calendar, maharaji darshan dates, and local sabha events — coming soon."
      previewCards={[
        { title: 'Paryushana 2026', subtitle: 'Aug 22 - Aug 29, 2026' },
        { title: 'Mahavir Jayanti', subtitle: 'Celebrating the birth of Lord Mahavir' },
        { title: 'Local Satsang', subtitle: 'Community gatherings near you' },
      ]}
      onNotify={() => setNotifyEvents(true)}
      notified={notifyEvents}
    />
  );
}
