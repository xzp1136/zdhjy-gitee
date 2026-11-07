  (func (;43441;) (type 46) (param i32 f32 i32 i32)
    (local i32 i32 i32 i64 i64 i64 f32 f32)
    global.get 0
    i32.const 112
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366748
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3403044
      call 2180
      i32.const 3356080
      call 2180
      i32.const 3407960
      call 2180
      i32.const 3408248
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420048
      call 2180
      i32.const 3420056
      call 2180
      i32.const 3420124
      call 2180
      i32.const 3420144
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420172
      call 2180
      i32.const 3429360
      call 2180
      i32.const 3429364
      call 2180
      i32.const 3429368
      call 2180
      i32.const 3369168
      call 2180
      i32.const 4366748
      i32.const 1
      i32.store8
    end
    i32.const 3369168
    i32.load
    call 1900
    local.tee 3
    local.get 2
    i32.store offset=36
    local.get 3
    local.get 0
    i32.store offset=16
    local.get 0
    i32.load offset=60
    local.set 2
    i32.const 3360788
    i32.load
    local.tee 5
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 5
      call 60460
    end
    block  ;; label = @1
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 3
        i32.load offset=36
        local.tee 3
        i32.eqz
        br_if 1 (;@1;)
        local.get 3
        i32.load offset=32
        local.get 3
        i32.load offset=20
        local.get 3
        i32.load offset=12
        call_indirect (type 1)
        br 1 (;@1;)
      end
      local.get 0
      i32.load offset=60
      local.get 4
      i32.const 96
      i32.add
      i32.const 3408248
      i32.load
      call 45354
      local.get 3
      local.get 4
      i32.load offset=96
      local.tee 2
      i32.store offset=20
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 3
        i32.load offset=36
        local.tee 3
        i32.eqz
        br_if 1 (;@1;)
        local.get 3
        i32.load offset=32
        local.get 3
        i32.load offset=20
        local.get 3
        i32.load offset=12
        call_indirect (type 1)
        br 1 (;@1;)
      end
      local.get 3
      i32.load offset=20
      i32.const 0
      i32.const 0
      call 7821
      drop
      local.get 3
      i32.load offset=20
      local.get 4
      i32.const 96
      i32.add
      i32.const 3403044
      i32.load
      call 45307
      local.get 3
      local.get 4
      i32.load offset=96
      local.tee 2
      i32.store offset=32
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      block  ;; label = @2
        local.get 2
        i32.const 0
        i32.const 0
        call 48872
        i32.eqz
        if  ;; label = @3
          local.get 3
          i32.load offset=32
          local.set 2
          br 1 (;@2;)
        end
        local.get 3
        local.get 3
        i32.load offset=20
        i32.const 0
        call 48736
        i32.const 3407960
        i32.load
        call 45355
        local.tee 2
        i32.store offset=32
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 7821
      drop
      i32.const 4377530
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364764
        call 2180
        i32.const 4377530
        i32.const 1
        i32.store8
      end
      local.get 3
      i32.const 3364764
      i32.load
      i32.load offset=92
      i64.load align=4
      i64.store offset=24 align=4
      local.get 4
      i32.const 96
      i32.add
      local.get 3
      i32.load offset=20
      i32.const 0
      call 49428
      local.get 4
      f32.load offset=104
      f32.const 0x1.4p+6 (;=80;)
      f32.add
      local.set 10
      local.get 3
      i64.load offset=24 align=4
      local.tee 8
      local.set 7
      i32.const 4358342
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364764
        call 2180
        i32.const 4358342
        i32.const 1
        i32.store8
        local.get 3
        i64.load offset=24 align=4
        local.set 7
      end
      local.get 3
      i32.load offset=20
      local.set 2
      local.get 4
      local.get 10
      i32.const 3364764
      i32.load
      i32.load offset=92
      i64.load offset=32 align=4
      local.tee 9
      i64.const 32
      i64.shr_u
      i32.wrap_i64
      f32.reinterpret_i32
      f32.mul
      local.get 8
      i64.const 32
      i64.shr_u
      i32.wrap_i64
      f32.reinterpret_i32
      f32.add
      i32.reinterpret_f32
      i64.extend_i32_u
      i64.const 32
      i64.shl
      local.get 10
      local.get 9
      i32.wrap_i64
      f32.reinterpret_i32
      f32.mul
      local.get 8
      i32.wrap_i64
      f32.reinterpret_i32
      f32.add
      i32.reinterpret_f32
      i64.extend_i32_u
      i64.or
      local.tee 8
      i64.store offset=88
      local.get 4
      local.get 8
      i64.store offset=48
      local.get 2
      local.get 4
      i32.const 48
      i32.add
      i32.const 0
      call 49438
      local.get 7
      i64.const 32
      i64.shr_u
      i32.wrap_i64
      f32.reinterpret_i32
      f32.const 0x0p+0 (;=0;)
      f32.add
      i32.reinterpret_f32
      i64.extend_i32_u
      i64.const 32
      i64.shl
      local.set 8
      local.get 7
      i32.wrap_i64
      f32.reinterpret_i32
      f32.const 0x1.4p+4 (;=20;)
      f32.add
      i32.reinterpret_f32
      i64.extend_i32_u
      local.set 7
      local.get 3
      i32.load offset=20
      local.set 5
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 7
      local.get 8
      i64.or
      local.set 7
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 2
      f32.load offset=12
      local.set 10
      local.get 2
      f32.load offset=16
      local.set 11
      local.get 4
      i32.const 80
      i32.add
      local.tee 6
      local.get 2
      f32.load offset=20
      f32.const 0x1.70a3d8p-1 (;=0.72;)
      f32.mul
      f32.store
      local.get 4
      local.get 6
      i32.load
      i32.store offset=40
      local.get 4
      local.get 11
      f32.const 0x1.70a3d8p-1 (;=0.72;)
      f32.mul
      f32.store offset=76
      local.get 4
      local.get 10
      f32.const 0x1.70a3d8p-1 (;=0.72;)
      f32.mul
      f32.store offset=72
      local.get 4
      local.get 4
      i64.load offset=72
      i64.store offset=32
      local.get 5
      local.get 4
      i32.const 32
      i32.add
      i32.const 0
      call 49495
      local.get 3
      i32.load offset=32
      f32.const 0x0p+0 (;=0;)
      i32.const 0
      call 5979
      i32.const 3356080
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      i32.const 0
      call 7600
      local.set 2
      local.get 3
      i32.const 0
      i32.store8 offset=8
      local.get 3
      local.get 0
      i32.load offset=60
      i32.store offset=12
      i32.const 3354340
      i32.load
      call 1900
      local.tee 0
      local.get 3
      i32.const 3429360
      i32.load
      i32.const 0
      call 38015
      local.get 3
      local.get 0
      i32.store offset=40
      local.get 2
      local.get 1
      i32.const 3420124
      i32.load
      call 14786
      drop
      local.get 2
      local.get 3
      i32.load offset=32
      f32.const 0x1p+0 (;=1;)
      f32.const 0x1.99999ap-4 (;=0.1;)
      i32.const 0
      call 43990
      i32.const 0
      call 7801
      drop
      local.get 3
      i32.load offset=20
      local.set 0
      local.get 4
      local.get 7
      i64.store offset=24
      local.get 4
      local.get 7
      i64.store offset=64
      local.get 2
      local.get 0
      local.get 4
      i32.const 24
      i32.add
      f32.const 0x1.333334p-2 (;=0.3;)
      i32.const 0
      i32.const 0
      call 44003
      i32.const 9
      i32.const 3420144
      i32.load
      call 14789
      i32.const 0
      call 7802
      drop
      local.get 2
      local.get 3
      i32.load offset=20
      f32.const 0x1.0cccccp+0 (;=1.05;)
      f32.const 0x1.333334p-2 (;=0.3;)
      i32.const 0
      call 7782
      i32.const 27
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7802
      drop
      local.get 3
      i32.load offset=20
      local.set 0
      local.get 4
      local.get 3
      i64.load offset=24 align=4
      local.tee 7
      i64.store offset=16
      local.get 4
      local.get 7
      i64.store offset=56
      local.get 2
      local.get 0
      local.get 4
      i32.const 16
      i32.add
      f32.const 0x1.99999ap-5 (;=0.05;)
      i32.const 0
      i32.const 0
      call 44003
      i32.const 6
      i32.const 3420144
      i32.load
      call 14789
      i32.const 0
      call 7801
      drop
      local.get 3
      i32.load offset=20
      local.set 0
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 4
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 5
      i32.load offset=20
      i32.store offset=8
      local.get 4
      local.get 5
      i64.load offset=12 align=4
      i64.store
      local.get 2
      local.get 0
      local.get 4
      f32.const 0x1.99999ap-5 (;=0.05;)
      i32.const 0
      call 7781
      i32.const 6
      i32.const 3420152
      i32.load
      call 14789
      i32.const 0
      call 7802
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 0
      local.get 3
      i32.const 3429364
      i32.load
      i32.const 0
      call 7547
      local.get 2
      local.get 0
      i32.const 3420048
      i32.load
      call 14773
      drop
      i32.const 3364124
      i32.load
      call 1900
      local.tee 0
      local.get 3
      i32.const 3429368
      i32.load
      i32.const 0
      call 7547
      local.get 2
      local.get 0
      i32.const 3420056
      i32.load
      call 14774
      drop
      local.get 2
      local.get 3
      i32.load offset=20
      i32.const 0
      call 48736
      i32.const 6
      i32.const 3420172
      i32.load
      call 14799
      drop
    end
    local.get 4
    i32.const 112
    i32.add
    global.set 0)
