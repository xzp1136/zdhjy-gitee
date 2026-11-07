  (func (;43459;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i64 i64)
    global.get 0
    i32.const 80
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366761
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3357576
      call 2180
      i32.const 3387224
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3390456
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3385832
      call 2180
      i32.const 3390460
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3478012
      call 2180
      i32.const 3435544
      call 2180
      i32.const 3480872
      call 2180
      i32.const 4366761
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 0
    i32.load offset=100
    i32.const 1
    i32.sub
    local.tee 4
    i32.const 0
    local.get 4
    i32.const 0
    i32.gt_s
    select
    i32.store offset=100
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=77
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=76
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=92
      local.tee 4
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 4
      local.get 0
      i32.load offset=84
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=56
      local.get 4
      local.get 3
      i32.const 76
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 3
      i32.load offset=76
      i32.load offset=12
      local.get 0
      i32.load offset=72
      i32.ge_s
      if  ;; label = @2
        i32.const 3356428
        i32.load
        local.tee 0
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 0
          call 60460
        end
        i32.const 3480872
        i32.load
        i32.const 0
        call 55817
        br 1 (;@1;)
      end
      local.get 1
      local.get 0
      i32.load offset=68
      i32.ne
      if  ;; label = @2
        i32.const 3356428
        i32.load
        local.tee 0
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 0
          call 60460
        end
        i32.const 3435544
        i32.load
        i32.const 0
        call 55817
        br 1 (;@1;)
      end
      local.get 0
      i32.load offset=64
      local.get 0
      i32.load offset=92
      i32.const 1
      i32.add
      i32.const 0
      call 43247
      local.set 4
      local.get 2
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 4
      i32.eqz
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=12
      local.get 2
      i32.le_s
      br_if 0 (;@1;)
      local.get 4
      local.get 2
      local.get 3
      i32.const 76
      i32.add
      i32.const 3390460
      i32.load
      call 50458
      local.get 3
      i32.load offset=76
      local.set 7
      i32.const 4367473
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360844
        call 2180
        i32.const 4367473
        i32.const 1
        i32.store8
      end
      i32.const 3360844
      i32.load
      i32.load offset=92
      i32.load
      local.set 4
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      local.get 4
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      i32.load offset=68
      local.get 7
      i32.const 5
      i32.const 0
      call 43865
      local.set 4
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      local.get 4
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 4
      i32.const 0
      call 48828
      local.set 5
      i32.const 4377527
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377527
        i32.const 1
        i32.store8
      end
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 6
      i64.load align=4
      local.set 8
      local.get 3
      local.get 6
      i32.load offset=8
      local.tee 6
      i32.store offset=40
      local.get 3
      local.get 6
      i32.store offset=72
      local.get 3
      local.get 8
      i64.store offset=64
      local.get 3
      local.get 8
      i64.store offset=32
      local.get 5
      local.get 3
      i32.const 32
      i32.add
      i32.const 0
      call 49448
      local.get 4
      i32.const 0
      call 48828
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
      local.get 3
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 6
      i32.load offset=20
      i32.store offset=24
      local.get 3
      local.get 6
      i64.load offset=12 align=4
      i64.store offset=16
      local.get 5
      local.get 3
      i32.const 16
      i32.add
      i32.const 0
      call 49495
      local.get 4
      i32.const 0
      call 48828
      local.set 5
      i32.const 4377529
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361564
        call 2180
        i32.const 4377529
        i32.const 1
        i32.store8
      end
      i32.const 3361564
      i32.load
      i32.load offset=92
      local.tee 6
      i64.load align=4
      local.set 8
      local.get 3
      local.get 6
      i64.load offset=8 align=4
      local.tee 9
      i64.store offset=8
      local.get 3
      local.get 9
      i64.store offset=56
      local.get 3
      local.get 8
      i64.store offset=48
      local.get 3
      local.get 8
      i64.store
      local.get 5
      local.get 3
      i32.const 0
      call 49482
      local.get 0
      i32.load offset=56
      local.get 0
      i32.load offset=92
      local.get 3
      i32.const 76
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 3
      i32.load offset=76
      local.get 4
      i32.const 3387224
      i32.load
      call 50463
      local.get 0
      i32.load offset=56
      local.get 0
      i32.load offset=92
      local.get 3
      i32.const 76
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 3
      local.get 0
      i32.load offset=72
      local.get 3
      i32.load offset=76
      i32.load offset=12
      i32.sub
      local.tee 5
      i32.const 0
      local.get 5
      i32.const 0
      i32.gt_s
      select
      i32.store offset=76
      local.get 0
      i32.load offset=48
      local.set 5
      local.get 3
      i32.const 76
      i32.add
      i32.const 0
      call 53141
      local.set 6
      local.get 5
      i32.const 3478012
      i32.load
      local.get 6
      i32.const 0
      call 48049
      local.get 5
      i32.load
      local.tee 6
      i32.load offset=796
      local.get 6
      i32.load offset=792
      call_indirect (type 2)
      i32.const 3357576
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      call 43410
      local.tee 5
      if  ;; label = @2
        local.get 5
        i32.const 1
        i32.const 0
        call 41051
      end
      local.get 0
      local.get 4
      local.get 1
      local.get 2
      local.get 0
      call 43460
      local.get 0
      local.get 0
      call 43461
      local.get 0
      local.get 0
      call 43462
      local.get 0
      local.get 0
      local.get 7
      local.get 0
      call 43456
      i32.const 0
      call 48887
      drop
    end
    local.get 3
    i32.const 80
    i32.add
    global.set 0)
