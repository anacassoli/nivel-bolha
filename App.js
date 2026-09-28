import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';

export default function App() {

  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let assinatura;
    let ativo = true;

    async function iniciarSensores() {
      try {
        const disponivel = await Accelerometer.isAvailableAsync();

        if (!ativo) return;

        if (!disponivel) {
          setErro('Sensor indisponível. Abra em um celular físico.');
          return;
        }

        Accelerometer.setUpdateInterval(100);

        assinatura = Accelerometer.addListener((leitura) => {
          if (ativo) {
            setDados(leitura);
          }
        });

      } catch {
        if (ativo) {
          setErro('Não foi possível acessar o sensor. Reabra o App.');
        }
      }
    }

    iniciarSensores();

    return () => {
      ativo = false;
      assinatura?.remove();
    };
  }, []);

  const x = dados?.x ?? 0;
  const y = dados?.y ?? 0;

  const nivelado =
    dados !== null &&
    Math.abs(x) < 0.04 &&
    Math.abs(y) < 0.04;

  const cor = nivelado ? '#22c55e' : '#facc35';

  const deslocamentoX = -x * 100;
  const deslocamentoY = y * 100;

  const distancia = Math.hypot(deslocamentoX, deslocamentoY);
  const limite = Math.max(1, distancia / 90);

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <StatusBar style="light" />

      <Text style={styles.titulo}>Nível de Bolha</Text>

      <Text style={styles.instrucao}>
        Apoie o celular com a tela para cima.{'\n'}
        Incline devagar e observe a bolha.
      </Text>

      <View style={styles.nivel}>
        <View style={styles.linhaHorizontal} />
        <View style={styles.linhaVertical} />
        <View style={styles.alvo} />

        {dados && !erro && (
          <View
            style={[
              styles.bolha,
              {
                backgroundColor: cor,
                transform: [
                  { translateX: deslocamentoX / limite },
                  { translateY: deslocamentoY / limite },
                ],
              },
            ]}
          />
        )}
      </View>

      <Text style={[styles.status, { color: erro ? '#ef4444' : cor }]}>
        {erro || (!dados ? 'Aguardando sensor...' : nivelado ? 'Nivelado' : 'Inclinado')}
      </Text>

      <Text style={styles.leitura}>
        X: {dados ? x.toFixed(2) : '--'} g | Y: {dados ? y.toFixed(2) : '--'} g
      </Text>

      <Text style={styles.rodape}>
        Bolha verde no centro = celular nivelado
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },

  titulo: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  instrucao: {
    color: '#f8fafc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 20,
  },

  nivel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linhaHorizontal: {
    position: 'absolute',
    width: 300,
    height: 2,
    backgroundColor: '#f8fafc',
  },

  linhaVertical: {
    position: 'absolute',
    width: 2,
    height: 300,
    backgroundColor: '#f8fafc',
  },

  alvo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3d6092',
  },

  bolha: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 28,
    textAlign: 'center',
  },

  leitura: {
    color: '#f8fafc',
    fontSize: 16,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },

  rodape: {
    color: '#f8fafc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 28,
  },
});
