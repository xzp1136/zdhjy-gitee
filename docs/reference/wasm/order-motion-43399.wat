  (func (;43399;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366724
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3388528
      call 2180
      i32.const 3390824
      call 2180
      i32.const 3388532
      call 2180
      i32.const 3390828
      call 2180
      i32.const 3480860
      call 2180
      i32.const 4366724
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 0
    i32.store8 offset=44
    local.get 0
    i32.const 0
    i32.store offset=40
    local.get 0
    i64.const 0
    i64.store offset=20 align=4
    local.get 0
    local.get 2
    i32.store offset=36
    local.get 0
    local.get 1
    i32.store offset=32
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 1
        i32.load offset=12
        local.tee 5
        i32.const 0
        i32.le_s
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=16
        i32.load offset=12
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 3
        i32.const 1
        i32.ne
        local.set 6
        i32.const 0
        local.set 3
        i32.const 0
        local.set 2
        loop  ;; label = @3
          block  ;; label = @4
            local.get 3
            local.get 5
            i32.ge_s
            br_if 0 (;@4;)
            local.get 1
            local.get 3
            local.get 4
            i32.const 12
            i32.add
            i32.const 3390828
            i32.load
            call 50458
            i32.const 3388532
            i32.load
            local.set 3
            local.get 0
            i32.load offset=16
            local.set 5
            local.get 0
            i32.load offset=48
            local.get 2
            i32.gt_s
            if  ;; label = @5
              local.get 4
              i32.load offset=12
              local.set 1
              local.get 5
              local.get 2
              local.get 4
              i32.const 12
              i32.add
              local.get 3
              call 50458
              local.get 4
              i32.load offset=12
              local.tee 3
              i32.const 1
              i32.store8 offset=77
              local.get 3
              local.get 2
              i32.store offset=96
              local.get 3
              i32.load offset=28
              i32.const 0
              i32.const 0
              call 48833
              local.get 3
              i32.load offset=24
              local.get 3
              i32.load8_u offset=77
              i32.eqz
              i32.const 0
              call 48833
              local.get 3
              i32.load offset=52
              local.get 3
              i32.load8_u offset=77
              i32.eqz
              i32.const 0
              call 48833
              local.get 0
              i32.load offset=16
              local.get 2
              local.get 4
              i32.const 12
              i32.add
              i32.const 3388532
              i32.load
              call 50458
              local.get 4
              i32.load offset=12
              local.get 1
              local.get 2
              f32.convert_i32_s
              f32.const 0x1.eb851ep-5 (;=0.06;)
              f32.mul
              local.get 0
              call 43400
              local.get 0
              local.get 0
              i32.load offset=20
              i32.const 1
              i32.add
              i32.store offset=20
              br 1 (;@4;)
            end
            local.get 5
            local.get 2
            local.get 4
            i32.const 12
            i32.add
            local.get 3
            call 50458
            local.get 4
            i32.load offset=12
            local.tee 3
            i32.const 0
            i32.store8 offset=77
            local.get 3
            local.get 2
            i32.store offset=96
            local.get 3
            i32.load offset=28
            i32.const 1
            i32.const 0
            call 48833
            local.get 3
            i32.load offset=24
            local.get 3
            i32.load8_u offset=77
            i32.eqz
            i32.const 0
            call 48833
            local.get 3
            i32.load offset=52
            local.get 3
            i32.load8_u offset=77
            i32.eqz
            i32.const 0
            call 48833
            local.get 6
            br_if 0 (;@4;)
            i32.const 0
            call 56067
            i32.load8_u offset=620
            i32.eqz
            br_if 0 (;@4;)
            local.get 0
            i32.load offset=16
            local.get 2
            local.get 4
            i32.const 12
            i32.add
            i32.const 3388532
            i32.load
            call 50458
            local.get 4
            i32.load offset=12
            i32.const 0
            call 48736
            i32.const 0
            i32.const 0
            call 48833
          end
          local.get 2
          i32.const 1
          i32.add
          local.tee 2
          local.get 0
          i32.load offset=16
          i32.load offset=12
          i32.ge_s
          br_if 2 (;@1;)
          local.get 0
          i32.load offset=20
          local.set 3
          local.get 0
          i32.load offset=32
          local.tee 1
          i32.load offset=12
          local.set 5
          br 0 (;@3;)
        end
        unreachable
      end
      i32.const 3356428
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      i32.const 3480860
      i32.load
      i32.const 0
      call 55218
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0)
