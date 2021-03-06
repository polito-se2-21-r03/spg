import { Button, DatePicker, Popover, Select, Stack, TextField } from '@shopify/polaris';
import { CalendarMinor } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useState } from 'react';

import './DashboardDatePicker.scss';

export function DashboardDatePicker({ handleAnalytics }: any) {
  /**
   * Popover
   */
  const [popoverActive, setPopoverActive] = useState(false);
  const [defaultInput, setDefaultInput] = useState('Questo mese');
  const [input, setInput] = useState('Questo mese');

  // Used on first load 
  const [inputIsChanged, setInputIsChanged] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const date = new Date();
  const [{ month, year }, setDate] = useState({ month: date.getMonth(), year: date.getFullYear() });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
  });

  const dateOptions = new Map([
    ['Questo mese', {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    }],
    ['Mese scorso', {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    }],
    ['Personalizzato', {
      start: new Date(),
      end: new Date(),
    }],
  ])

  /** Select handler */
  const handleSelectChange = useCallback(e => {
    setInput(e);
    setSelectedDates({
      // @ts-ignore
      start: dateOptions.get(e).start,
      // @ts-ignore
      end: dateOptions.get(e).end
    });
    setDate({
      // @ts-ignore
      month: dateOptions.get(e)?.start.getMonth(),
      // @ts-ignore
      year: dateOptions.get(e)?.start.getFullYear()
    })
  }, [dateOptions]);

  const activator = (
    <Button icon={CalendarMinor} onClick={togglePopoverActive}>{defaultInput}</Button>
  )

  /** 
   * Date picker 
   */
  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    [],
  );

  /** Date picker selected date handler */
  const handleSelectedDate = useCallback((e) => {
    setSelectedDates({
      start: e.start,
      end: e.end,
    });

    // Check if map contains this set of date
    // @ts-ignore
    for (const [key, value] of dateOptions) {
      if (key === 'Personalizzato')
        continue;

      if (new Date(value.start).toDateString() !== e.start.toDateString() || new Date(value.end).toDateString() !== e.end.toDateString()) {
        // Add Personalizzato to dateOptions
        dateOptions.set('Personalizzato', {
          start: e.start,
          end: e.end
        })
        setInput('Personalizzato');
      } else if (new Date(value.start).toDateString() === e.start.toDateString() && new Date(value.end).toDateString() === e.end.toDateString()) {
        // Remove Personalizzato
        if (dateOptions.has('Personalizzato')) {
          dateOptions.delete('Personalizzato');
        }

        setInput(key);
        break;
      }
    }
  }, [dateOptions]);

  const parseDateLabel = (date: Date) => {
    return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)}`;
  }

  /**
   * Data fetching:
   * - fetch branches
   * - fetch analytics
   */
  useEffect(() => {
    let customers: any[] = [];
    const branchesMap = new Map();

    // Fetch clients
    const fetchClients = async () => {
      try {
        const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/customers', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        const response = await data.json();

        if (response.status === 'success') {
          let tmp = [];
          for (const item of response.data) {
            tmp.push({ id: item._id, name: item.name });
          }
          // @ts-ignore
          customers = tmp;
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchClients();

    // Fetch Branches
    const fetchBranches = async () => {
      try {
        const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/branches', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        const response = await data.json();

        if (response.status === 'success') {
          for (const item of response.data) {
            branchesMap.set(item._id, item.label);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchBranches();

    // Fetch analytics
    const fetchAnalytics = async () => {
      try {
        const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/analytics', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            start: selectedDates.start,
            end: selectedDates.end
          })
        })
        const response = await data.json();

        if (response.status === 'success') {
          const tmp = [];
          for (const item of response.data.scadenze) {
            const itemCustomer = item.customer_id;
            let customerName = '';

            customers.forEach((customer) => {
              if (customer.id === itemCustomer)
                customerName = customer.name;
            });

            item.branch_id = branchesMap.get(item.branch_id);

            tmp.push({ ...item, customer: customerName });
          }

          const res = {
            premioNetto: (response.data.aggData.length !== 0) ? response.data.aggData[0].premioNetto : 0,
            provvTot: (response.data.aggData.length !== 0) ? response.data.aggData[0].provvTot : 0,
            clienti: response.data.clienti,
            scadenze: tmp,
          }
          handleAnalytics(res);
        } else {
          const res = {
            provvTot: 0
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Submit handler
   */
  const handleSubmit = useCallback(async () => {
    try {
      setDefaultInput(input);
      setInputIsChanged(true);

      const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/analytics', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start: selectedDates.start,
          end: selectedDates.end
        })
      })
      const response = await data.json();

      if (response.status === 'success') {
        console.log(response);
        setPopoverActive(false);
        const res = {
          premioNetto: (response.data.aggData.length !== 0) ? response.data.aggData[0].premioNetto : 0,
          provvAttive: (response.data.aggData.length !== 0) ? response.data.aggData[0].provvAttive : 0,
          provvPassive: (response.data.aggData.length !== 0) ? response.data.aggData[0].provvPassive : 0,
          clienti: response.data.clienti,
          scadenze: response.data.scadenze,
        }
        handleAnalytics(res);
      } else {
        const res = {
          provvAttive: 0,
          provvPassive: 0,
        }
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDates.end, selectedDates.start]);

  const popoverMarkup = (
    <div>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopoverActive}
        ariaHaspopup={false}
        preferredAlignment="left"
        fluidContent
      >
        <Popover.Pane sectioned>
          <Stack vertical wrap>
            <Select label="Intervallo di date" options={Array.from(dateOptions.keys())}
              value={input}
              onChange={handleSelectChange}
            />
            <Stack distribution="fillEvenly">
              <TextField autoComplete="off" label="Inizio" value={parseDateLabel(selectedDates.start)} onChange={() => { }} />
              <TextField autoComplete="off" label="Fine" value={parseDateLabel(selectedDates.end)} onChange={() => { }} />
            </Stack>
            <div className="popoverDatePicker">
              <DatePicker
                month={month}
                year={year}
                onChange={handleSelectedDate}
                onMonthChange={handleMonthChange}
                selected={selectedDates}
                multiMonth
                allowRange
              />
            </div>
          </Stack>
        </Popover.Pane>
        <Popover.Pane fixed>
          <Popover.Section>
            <Stack distribution="equalSpacing">
              <div>
                <Button onClick={() => { setPopoverActive(false) }}>Annulla</Button>
              </div>
              <div>
                <Button
                  primary
                  disabled={(input === defaultInput) ? (input === 'Personalizzato' ? false : true) : false}
                  onClick={handleSubmit}
                >
                  Applica
                </Button>
              </div>
            </Stack>
          </Popover.Section>
        </Popover.Pane>
      </Popover>
    </div>
  )

  return popoverMarkup;
}