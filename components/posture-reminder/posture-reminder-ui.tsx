"use client";

import { useState, useEffect } from "react";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import { PainLocation } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpIcon,
  BellIcon,
  BellOffIcon,
  ClockIcon,
  SettingsIcon,
  ZapIcon,
  CalendarIcon,
  VolumeIcon,
  Volume2Icon,
  PlayIcon,
  PauseIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { format } from "date-fns";

export function PostureReminderUI() {
  const {
    settings,
    state,
    updateSettings,
    startReminders,
    stopReminders,
    snooze,
    logPain,
    getPainLogs,
  } = usePostureAlarm();

  const [showSettings, setShowSettings] = useState(false);
  const [showPainLog, setShowPainLog] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [painLocation, setPainLocation] = useState<PainLocation>(
    PainLocation.NECK
  );
  const [painNotes, setPainNotes] = useState("");
  const [reminderActive, setReminderActive] = useState(false);

  // Update reminder active state based on actual state
  useEffect(() => {
    setReminderActive(state.isActive);
  }, [state.isActive]);

  // Format time until next reminder
  const formatTimeUntilNextReminder = () => {
    if (!state.nextReminder) return "Not scheduled";

    const now = Date.now();
    const timeUntil = state.nextReminder - now;

    if (timeUntil <= 0) return "Due now";

    const minutes = Math.floor(timeUntil / 60000);
    const seconds = Math.floor((timeUntil % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle pain log submission
  const handleLogPain = () => {
    logPain(painLevel, painLocation, painNotes);
    setPainLevel(0);
    setPainLocation(PainLocation.NECK);
    setPainNotes("");
    setShowPainLog(false);
  };

  // Get recent pain logs
  const recentLogs = getPainLogs(7);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowUpIcon className="h-4 w-4" />
              Posture Reminder
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            {reminderActive
              ? "Actively monitoring your posture"
              : "Posture monitoring is paused"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Next reminder</span>
                </div>
                <span className="text-sm font-medium">
                  {formatTimeUntilNextReminder()}
                </span>
              </div>
            </div>

            {state.snoozeUntil && state.snoozeUntil > Date.now() && (
              <div className="rounded-md bg-yellow-100 p-3 dark:bg-yellow-950">
                <div className="flex items-center gap-2">
                  <BellOffIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    Snoozed until{" "}
                    {format(new Date(state.snoozeUntil), "h:mm a")}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant={reminderActive ? "destructive" : "default"}
                className="flex-1 gap-1"
                onClick={reminderActive ? stopReminders : startReminders}
              >
                {reminderActive ? (
                  <>
                    <PauseIcon className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" /> Start
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="ml-2 gap-1"
                onClick={() => setShowPainLog(true)}
              >
                <ZapIcon className="h-4 w-4" /> Log Pain
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="flex w-full flex-col gap-2">
            <div className="grid grid-cols-3 gap-1">
              {settings.snoozeOptions.slice(0, 3).map((minutes) => (
                <Button
                  key={minutes}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => snooze(minutes)}
                >
                  Snooze {minutes}m
                </Button>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Posture Reminder Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable Reminders</Label>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  updateSettings({ enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Reminder Interval (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="interval"
                  min={5}
                  max={60}
                  step={5}
                  value={[settings.interval]}
                  onValueChange={(values) =>
                    updateSettings({ interval: values[0] })
                  }
                  className="flex-1"
                />
                <span className="w-12 text-center">{settings.interval}m</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workStartHour" className="text-xs">
                    Start Time
                  </Label>
                  <select
                    id="workStartHour"
                    value={settings.workStartHour}
                    onChange={(e) =>
                      updateSettings({ workStartHour: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0
                          ? "12 AM"
                          : i < 12
                            ? `${i} AM`
                            : i === 12
                              ? "12 PM"
                              : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="workEndHour" className="text-xs">
                    End Time
                  </Label>
                  <select
                    id="workEndHour"
                    value={settings.workEndHour}
                    onChange={(e) =>
                      updateSettings({ workEndHour: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0
                          ? "12 AM"
                          : i < 12
                            ? `${i} AM`
                            : i === 12
                              ? "12 PM"
                              : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Days</Label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <Button
                      key={index}
                      variant={
                        settings.workDays.includes(index)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        const newWorkDays = settings.workDays.includes(index)
                          ? settings.workDays.filter((d) => d !== index)
                          : [...settings.workDays, index];
                        updateSettings({ workDays: newWorkDays });
                      }}
                      className="h-8 w-10"
                    >
                      {day}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="soundEnabled">Sound Alerts</Label>
              <Switch
                id="soundEnabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ soundEnabled: checked })
                }
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2">
                <Label
                  htmlFor="soundVolume"
                  className="flex items-center gap-2"
                >
                  <VolumeIcon className="h-4 w-4" />
                  Sound Volume
                  <Volume2Icon className="ml-auto h-4 w-4" />
                </Label>
                <Slider
                  id="soundVolume"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.soundVolume]}
                  onValueChange={(values) =>
                    updateSettings({ soundVolume: values[0] })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsEnabled">
                Desktop Notifications
              </Label>
              <Switch
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ notificationsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoPauseInMeetings">
                Auto-pause during meetings
              </Label>
              <Switch
                id="autoPauseInMeetings"
                checked={settings.autoPauseInMeetings}
                onCheckedChange={(checked) =>
                  updateSettings({ autoPauseInMeetings: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoPauseDuringFocus">
                Auto-pause during focus time
              </Label>
              <Switch
                id="autoPauseDuringFocus"
                checked={settings.autoPauseDuringFocus}
                onCheckedChange={(checked) =>
                  updateSettings({ autoPauseDuringFocus: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Snooze Options (minutes)</Label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 30, 45, 60].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={
                      settings.snoozeOptions.includes(minutes)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      const newOptions = settings.snoozeOptions.includes(
                        minutes
                      )
                        ? settings.snoozeOptions.filter((m) => m !== minutes)
                        : [...settings.snoozeOptions, minutes].sort(
                            (a, b) => a - b
                          );
                      updateSettings({ snoozeOptions: newOptions });
                    }}
                  >
                    {minutes}m
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pain Log Dialog */}
      <Dialog open={showPainLog} onOpenChange={setShowPainLog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Posture Pain</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pain Level (0-10)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[painLevel]}
                  onValueChange={(values) => setPainLevel(values[0])}
                  className="flex-1"
                />
                <span className="w-10 text-center font-medium">
                  {painLevel}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No Pain</span>
                <span>Severe Pain</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pain Location</Label>
              <RadioGroup
                value={painLocation}
                onValueChange={(value) =>
                  setPainLocation(value as PainLocation)
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PainLocation.NECK} id="neck" />
                    <Label htmlFor="neck">Neck</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={PainLocation.UPPER_BACK}
                      id="upper_back"
                    />
                    <Label htmlFor="upper_back">Upper Back</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={PainLocation.LOWER_BACK}
                      id="lower_back"
                    />
                    <Label htmlFor="lower_back">Lower Back</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={PainLocation.SHOULDERS}
                      id="shoulders"
                    />
                    <Label htmlFor="shoulders">Shoulders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PainLocation.WRISTS} id="wrists" />
                    <Label htmlFor="wrists">Wrists</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PainLocation.OTHER} id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pain-notes">Notes</Label>
              <Textarea
                id="pain-notes"
                placeholder="Any additional details about your pain..."
                value={painNotes}
                onChange={(e) => setPainNotes(e.target.value)}
                rows={3}
              />
            </div>

            {recentLogs.length > 0 && (
              <div className="space-y-2">
                <Label>Recent Pain History</Label>
                <div className="max-h-32 overflow-y-auto rounded-md border p-2">
                  {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="mb-2 text-xs">
                      <div className="flex justify-between">
                        <span>
                          <strong>Level {log.level}</strong> ({log.location})
                        </span>
                        <span className="text-muted-foreground">
                          {format(new Date(log.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowPainLog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogPain} className="gap-1">
              <ThumbsUpIcon className="h-4 w-4" />
              Log Pain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
